import { and, desc, eq, inArray, like } from "drizzle-orm";
import { labels, posts } from "../schema";
import { drizzle } from "drizzle-orm/d1";

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const searchParams = new URL(request.url).searchParams;
  const q = searchParams.get("q");
  if (!q || !q.trim()) {
    return Response.json({ error: "Missing query" }, { status: 400 });
  }

  const db = drizzle(env.DB);
  const items = await (async () => {
    const words = q.split(/\s+/);
    const queryPrefixedLabels = words.filter((word) =>
      word.startsWith("label:")
    );
    if (queryPrefixedLabels.length > 0) {
      // Only support one label query
      const queryLabel = queryPrefixedLabels[0].substring(6);
      const items = await db
        .select()
        .from(posts)
        .innerJoin(
          labels,
          and(eq(posts.rowid, labels.postId), eq(labels.name, queryLabel))
        )
        .where(eq(posts.status, "publish"))
        .all();
      return items.map((item) => item.posts).reverse();
    } else if (words.length > 0) {
      const query = words.join(" ");
      return db
        .select()
        .from(posts)
        .where(
          and(
            eq(posts.type, "post"),
            eq(posts.status, "publish"),
            like(posts.title, `%${query}%`)
          )
        )
        .orderBy(desc(posts.published))
        .all();
    }

    return db.select().from(posts).all();
  })();

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
