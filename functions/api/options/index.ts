import { drizzle } from "drizzle-orm/d1";
import { options } from "../schema";
import { jwtAuthenication } from "../auth";
import { inArray, sql } from "drizzle-orm";
import jwt from "@tsndr/cloudflare-worker-jwt";

interface Env {
  DB: D1Database;
  SECRET?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  if (!env.SECRET) {
    return new Response(JSON.stringify({ error: "Secret not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = drizzle(env.DB);
  const items = await db.select().from(options).all();
  const result: Record<string, string> = {};
  items.forEach((item) => {
    result[item.key] = item.value;
  });

  if (typeof result.adminPassword === "string")
    result.adminPassword = "********";

  return Response.json(result, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "application/json",
    },
  });
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
  const body: Record<string, string> = await request.json();

  if (body.adminPassword) {
    const password = body.adminPassword;
    delete body.adminPassword;
    const username = body.adminUsername;
    if (username) {
      body.adminPassword = await jwt.sign({ username }, password);
    }
  }

  const keysToDelete = Object.keys(body).filter((key) => body[key] === null);
  if (keysToDelete.length)
    await db.delete(options).where(inArray(options.key, keysToDelete));
  keysToDelete.forEach((key) => delete body[key]);
  const optionsArray = Object.keys(body).map((key) => ({
    key,
    value: body[key],
  }));
  if (optionsArray.length)
    await db
      .insert(options)
      .values(optionsArray)
      .onConflictDoUpdate({
        target: [options.key],
        set: { value: sql`EXCLUDED.value` },
      });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
