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
  const items = await db.select().from(posts).all();
  items.reverse();
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
