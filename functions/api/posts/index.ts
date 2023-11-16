import { drizzle } from "drizzle-orm/d1";
import { posts } from "../schema";

interface Env {
  KV: KVNamespace;
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const db = drizzle(env.DB);
  const items = await db.select().from(posts).all();
  return Response.json({ items });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const { request, env } = context;
  const db = drizzle(env.DB);
  const body = await request.json() as typeof posts.$inferInsert;
  const item = await db.insert(posts).values(body).execute();
  return Response.json({ item });
}
