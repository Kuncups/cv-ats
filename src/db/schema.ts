import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    email: text("email").notNull().unique(),
    avatarUrl: text("avatar_url"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("idx_users_email").on(table.email)]
);

export const resumes = sqliteTable(
  "resumes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("Untitled Resume"),
    contentJson: text("content_json").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("idx_resumes_user_id").on(table.userId)]
);

export const scans = sqliteTable(
  "scans",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    targetJobTitle: text("target_job_title").notNull(),
    score: integer("score").notNull(),
    matchedKeywordsJson: text("matched_keywords_json").notNull(),
    missingKeywordsJson: text("missing_keywords_json").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("idx_scans_user_id").on(table.userId)]
);

export type User = typeof users.$inferSelect;
export type Resume = typeof resumes.$inferSelect;
export type Scan = typeof scans.$inferSelect;
