import { sql } from "drizzle-orm";
import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
  id: text("id"),
  published: integer("published")
    .notNull()
    .default(sql`(CAST(unixepoch() * 1000 AS INTEGER))`),
  updated: integer("updated")
    .notNull()
    .default(sql`(CAST(unixepoch() * 1000 AS INTEGER))`),
  title: text("title").notNull(),
  content: text("content").notNull(),
});

export const replies = sqliteTable("replies", {
  id: text("id"),
  published: integer("published")
    .notNull()
    .default(sql`(CAST(unixepoch() * 1000 AS INTEGER))`),
  content: text("content").notNull(),
  postId: text("postId")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
});
