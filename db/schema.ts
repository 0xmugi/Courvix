// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer, blob, index } from "drizzle-orm/sqlite-core";
export const demoWorkspaces = sqliteTable("demo_workspaces", {
  owner: text("owner").primaryKey(),
  payload: text("payload").notNull(),
  revision: integer("revision").notNull().default(0),
  updatedAt: text("updated_at").notNull(),
});

export const profileFiles=sqliteTable("profile_files",{id:text("id").primaryKey(),owner:text("owner").notNull(),subject:text("subject").notNull(),kind:text("kind").notNull(),name:text("name").notNull(),mime:text("mime").notNull(),size:integer("size").notNull(),category:text("category").notNull(),content:blob("content",{mode:"buffer"}).notNull(),createdAt:text("created_at").notNull()},t=>[index("profile_files_owner_subject").on(t.owner,t.subject,t.kind)]);
