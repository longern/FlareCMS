import { and, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { labels, posts } from "../schema";
import sanitizeHtml from "sanitize-html";
import { basicAuthenication } from "../auth";

interface Env {
  DB: D1Database;
  USERNAME?: string;
  PASSWORD?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const db = drizzle(env.DB);
  const items = await (async () => {
    const q = new URL(request.url).searchParams.get("q");
    if (!q) return db.select().from(posts).all();

    const words = q.split(/\s+/);
    const queryPrefixedLabels = words.filter((word) =>
      word.startsWith("label:")
    );
    if (queryPrefixedLabels.length > 0) {
      // Only support one label query
      const queryLabel = queryPrefixedLabels[0].substring(6);
      const items = await db
        .select()
        .from(posts)
        .innerJoin(
          labels,
          and(eq(posts.id, labels.postId), eq(labels.name, queryLabel))
        )
        .all();
      return items.map((item) => item.posts);
    }

    return db.select().from(posts).all();
  })();
  items.reverse();

  const postIds = items.map((item) => item.id);
  const postLabels = postIds.length
    ? await db
        .select({ name: labels.name, postId: labels.postId })
        .from(labels)
        .where(inArray(labels.postId, postIds))
        .all()
    : [];
  const postLabelsMap = postLabels.reduce((map, label) => {
    if (!map[label.postId]) map[label.postId] = [];
    map[label.postId].push(label.name);
    return map;
  }, {} as Record<string, string[]>);
  const result = items.map((item) => {
    return Object.assign(item, { labels: postLabelsMap[item.id] || [] });
  });

  return Response.json({ items: result });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!request.headers.get("Authorization") || !basicAuthenication(context)) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
    });
  }

  const db = drizzle(env.DB);
  const body: typeof posts.$inferInsert & { labels?: string[] } =
    await request.json();
  body.id = crypto.randomUUID();

  if (body.content) {
    body.content = sanitizeHtml(body.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      allowIframeRelativeUrls: true,
    });
  }

  const postLabels: string[] = body.labels || [];
  delete body.labels;

  const result = await db.insert(posts).values(body).execute();
  if (result.success) {
    if (postLabels.length > 0) {
      await db
        .insert(labels)
        .values(postLabels.map((name) => ({ postId: body.id, name })))
        .execute();
    }
    return Response.json(body);
  } else {
    return Response.json({ error: result.error }, { status: 500 });
  }
};
