import { drizzle } from "drizzle-orm/d1";
import { options } from "../schema";
import { basicAuthenication } from "../auth";
import { inArray } from "drizzle-orm";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const db = drizzle(env.DB);
  const items = await db.select().from(options).all();
  const result: Record<string, string> = {};
  items.forEach((item) => {
    result[item.key] = item.value;
  });
  return Response.json(result, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "application/json",
    },
  });
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
  const body: typeof options.$inferInsert = await request.json();

  const keysToDelete = Object.keys(body).filter((key) => body[key] === null);
  await db.delete(options).where(inArray(options.key, keysToDelete));
  keysToDelete.forEach((key) => delete body[key]);
  await db
    .insert(options)
    .values(body)
    .onConflictDoUpdate({ target: [options.key], set: body });

  return new Response(null, { status: 204 });
};
