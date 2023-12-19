import { drizzle } from "drizzle-orm/d1";
import { options } from "./schema";
import { eq, or } from "drizzle-orm";
import jwt from "@tsndr/cloudflare-worker-jwt";

interface Env {
  DB: D1Database;
  SECRET?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const db = drizzle(env.DB);
  const body: {
    blogName: string;
    adminUsername: string;
    adminPassword: string;
  } = await request.json();

  const result = await db
    .select()
    .from(options)
    .where(
      or(eq(options.key, "adminUsername"), eq(options.key, "adminPassword"))
    )
    .execute();
  if (result.length) {
    return Response.json(
      { error: "Already installed" },
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const jwtToken = await jwt.sign(
    { username: body.adminUsername },
    body.adminPassword
  );
  await db
    .insert(options)
    .values([
      { key: "blogName", value: body.blogName },
      { key: "blogPublished", value: new Date().toISOString() },
      { key: "adminUsername", value: body.adminUsername },
      { key: "adminPassword", value: jwtToken },
    ])
    .execute();

  return Response.json(
    { success: true },
    { headers: { "Content-Type": "application/json" } }
  );
};
