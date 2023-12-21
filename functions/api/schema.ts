import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable(
  "posts",
  {
    rowid: integer("rowid").primaryKey(),
    published: integer("published")
      .notNull()
      .default(sql`(ROUND(unixepoch('subsec') * 1000))`),
    updated: integer("updated")
      .notNull()
      .default(sql`(ROUND(unixepoch('subsec') * 1000))`),
    type: text("type").$type<"post" | "page">().notNull().default("post"),
    status: text("status")
      .$type<"publish" | "draft">()
      .notNull()
      .default("publish"),
    title: text("title").notNull(),
    content: text("content").notNull(),
  },
  (table) => {
    return {
      typeStatusPublishedIdIdx: index("typeStatusPublishedIdIdx").on(
        table.type,
        table.status,
        table.published,
        table.rowid
      ),
    };
  }
);

export const labels = sqliteTable(
  "labels",
  {
    postId: integer("postId")
      .notNull()
      .references(() => posts.rowid, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
  },
  (table) => {
    return {
      idNameIdx: index("idNameIdx").on(table.postId, table.name),
      nameIdx: index("nameIdx").on(table.name),
    };
  }
);

export const replies = sqliteTable(
  "replies",
  {
    rowid: integer("rowid").primaryKey(),
    published: integer("published")
      .notNull()
      .default(sql`(ROUND(unixepoch('subsec') * 1000))`),
    content: text("content").notNull(),
    postId: integer("postId")
      .notNull()
      .references(() => posts.rowid, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      postIdIdx: index("postIdIdx").on(table.postId),
    };
  }
);

export const options = sqliteTable("options", {
  key: text("key").primaryKey().notNull(),
  value: text("value").notNull(),
});
