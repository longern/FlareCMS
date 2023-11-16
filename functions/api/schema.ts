import { sql } from "drizzle-orm";
import { text, sqliteTable } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
  id: text("id"),
  published: text('published').notNull().default(sql`CURRENT_TIMESTAMP`),
  title: text("title").notNull(),
  content: text("content").notNull(),
});

export const replies = sqliteTable("replies", {
  id: text("id"),
  published: text('published').notNull().default(sql`CURRENT_TIMESTAMP`),
  content: text("content").notNull(),
  postId: text("postId").notNull(),
});
