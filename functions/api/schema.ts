import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey().notNull(),
  published: integer("published")
    .notNull()
    .default(sql`(CAST(unixepoch() * 1000 AS INTEGER))`),
  updated: integer("updated")
    .notNull()
    .default(sql`(CAST(unixepoch() * 1000 AS INTEGER))`),
  title: text("title").notNull(),
  content: text("content").notNull(),
});

export const labels = sqliteTable(
  "labels",
  {
    postId: text("postId")
      .notNull()
      .references(() => posts.id, {
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
    id: text("id").primaryKey(),
    published: integer("published")
      .notNull()
      .default(sql`(CAST(unixepoch() * 1000 AS INTEGER))`),
    content: text("content").notNull(),
    postId: text("postId")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      postIdIdx: index("postIdIdx").on(table.postId),
    };
  }
);
