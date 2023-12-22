import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { labels } from "../schema";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const cache = (caches as CacheStorage & { default: Cache }).default;
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const db = drizzle(env.DB);
  const items = await db
    .select({ name: labels.name, count: count() })
    .from(labels)
    .groupBy(labels.name)
    .all();
  items.sort((a, b) => b.count - a.count);

  const response = Response.json(
    { items },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "application/json",
      },
    }
  );
  cache.put(request, response.clone());
  return response;
};
