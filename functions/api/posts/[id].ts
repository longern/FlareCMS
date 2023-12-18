import { drizzle } from "drizzle-orm/d1";
import { labels, posts } from "../schema";
import { and, eq, inArray } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import { jwtAuthenication } from "../auth";

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
    const item: Record<string, any> = items[0];
    const postLabels = await db
      .select({ name: labels.name })
      .from(labels)
      .where(eq(labels.postId, item.id))
      .all();
    item.labels = postLabels.map((label) => label.name);
    return Response.json(item);
  }
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const postId = params.id as string;

  if (!jwtAuthenication(context)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = drizzle(env.DB);
  const body: typeof posts.$inferInsert & { labels?: string[] } =
    await request.json();
  delete body.id;

  if (body.content) {
    body.content = sanitizeHtml(body.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      allowIframeRelativeUrls: true,
    });
  }

  if (body.labels) {
    const postLabels: string[] = body.labels || [];
    delete body.labels;
    const currentLabels = await db
      .select({ name: labels.name })
      .from(labels)
      .where(eq(labels.postId, postId))
      .all()
      .then((items) => items.map((item) => item.name));
    const newLabels = postLabels.filter(
      (label) => !currentLabels.includes(label)
    );
    const deleteLabels = currentLabels.filter(
      (current) => !postLabels.includes(current)
    );
    if (newLabels.length > 0)
      await db
        .insert(labels)
        .values(newLabels.map((label) => ({ postId, name: label })))
        .execute();
    if (deleteLabels.length > 0)
      await db
        .delete(labels)
        .where(
          and(eq(labels.postId, postId), inArray(labels.name, deleteLabels))
        )
        .execute();
  }

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
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

  if (!jwtAuthenication(context)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
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
