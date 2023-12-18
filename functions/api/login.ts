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

  const dict: Record<string, string> = {};
  result.forEach((item) => {
    dict[item.key] = item.value;
  });

  const isEqual =
    dict.adminUsername === body.adminUsername &&
    (await jwt.verify(dict.adminPassword, body.adminPassword));

  if (!isEqual) {
    return Response.json(
      { error: "Wrong username or password" },
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const token = await jwt.sign(
    {
      username: body.adminUsername,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
    env.SECRET
  );
  return Response.json(
    { token },
    { headers: { "Content-Type": "application/json" } }
  );
};
