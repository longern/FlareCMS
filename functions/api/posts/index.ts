import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { labels, posts } from "../schema";
import sanitizeHtml from "sanitize-html";
import { jwtAuthenication } from "../auth";

interface Env {
  DB: D1Database;
  USERNAME?: string;
  PASSWORD?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const db = drizzle(env.DB);
  const searchParams = new URL(request.url).searchParams;
  const baseQuery = db.select().from(posts);

  const conditions = [eq(sql`1`, 1)];

  const type = searchParams.get("type") as "post" | "page";
  if (type) conditions.push(eq(posts.type, type));

  const status = searchParams.get("status") as "publish" | "draft";
  if (status) conditions.push(eq(posts.status, status));

  const items = await baseQuery
    .where(and(...conditions))
    .orderBy(desc(posts.published))
    .all();

  const postIds = items.map((item) => item.rowid);
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
    return Object.assign(item, { labels: postLabelsMap[item.rowid] || [] });
  });

  return Response.json({ items: result });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!jwtAuthenication(context)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = drizzle(env.DB);
  const body: typeof posts.$inferInsert & { labels?: string[] } =
    await request.json();

  if (body.content) {
    body.content = sanitizeHtml(body.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      allowIframeRelativeUrls: true,
    });
  }

  const postLabels: string[] = body.labels || [];
  delete body.labels;

  try {
    const result = await db
      .insert(posts)
      .values(body)
      .returning({ rowid: posts.rowid })
      .execute();
    if (result.length) {
      const post = result[0];
      if (postLabels.length > 0) {
        await db
          .insert(labels)
          .values(postLabels.map((name) => ({ postId: post.rowid, name })))
          .execute();
      }
      return Response.json(post);
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
