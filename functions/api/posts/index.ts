import { inArray } from "drizzle-orm";
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
  const env = context.env;
  const db = drizzle(env.DB);
  const items: (typeof posts.$inferSelect & { labels?: string[] })[] = await db
    .select()
    .from(posts)
    .all();
  items.reverse();

  const postIds = items.map((item) => item.id);
  const postLabels = await db
    .select({ name: labels.name, postId: labels.postId })
    .from(labels)
    .where(inArray(labels.postId, postIds))
    .all();
  const postLabelsMap = postLabels.reduce((map, label) => {
    if (!map[label.postId]) map[label.postId] = [];
    map[label.postId].push(label.name);
    return map;
  }, {} as Record<string, string[]>);
  items.forEach((item) => {
    item.labels = postLabelsMap[item.id] || [];
  });

  return Response.json({ items });
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
    body.content = sanitizeHtml(body.content);
  }

  const postLabels: string[] = body.labels || [];
  delete body.labels;

  const result = await db.insert(posts).values(body).execute();
  if (result.success) {
    await db
      .insert(labels)
      .values(postLabels.map((name) => ({ postId: body.id, name })))
      .execute();
    return Response.json(body);
  } else {
    return Response.json({ error: result.error }, { status: 500 });
  }
};
