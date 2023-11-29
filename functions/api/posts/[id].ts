import { drizzle } from "drizzle-orm/d1";
import { posts } from "../schema";
import { eq } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import { basicAuthenication } from "../auth";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  const key = params.id as string;
  const db = drizzle(env.DB);
  const items = await db.select().from(posts).where(eq(posts.id, key));
  if (items.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  } else {
    return Response.json(items[0]);
  }
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

  if (!request.headers.get("Authorization") || !basicAuthenication(context)) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
    });
  }

  const db = drizzle(env.DB);
  const body: typeof posts.$inferInsert = await request.json();
  delete body.id;

  if (body.content) {
    body.content = sanitizeHtml(body.content);
  }

  const postId = params.id as string;
  const result = await db
    .update(posts)
    .set(body)
    .where(eq(posts.id, postId))
    .execute();
  if (result.success) {
    return Response.json(body);
  } else {
    return Response.json({ error: result.error }, { status: 500 });
  }
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

  if (!request.headers.get("Authorization") || !basicAuthenication(context)) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
    });
  }

  const key = params.id as string;
  const db = drizzle(env.DB);
  const result = await db.delete(posts).where(eq(posts.id, key)).execute();
  if (result.success) {
    return new Response(null, { status: 204 });
  } else {
    return Response.json({ error: result.error }, { status: 500 });
  }
};
