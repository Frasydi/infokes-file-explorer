import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  parentId: integer("parent_id"),
  path: varchar("path", { length: 1000 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  folderId: integer("folder_id").notNull(),
  size: integer("size").default(0),
  extension: varchar("extension", { length: 10 }),
  path: varchar("path", { length: 1000 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const foldersRelations = relations(folders, ({ one, many }) => ({
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
    relationName: "parent_child"
  }),
  children: many(folders, {
    relationName: "parent_child"
  }),
  files: many(files),
}));

export const filesRelations = relations(files, ({ one }) => ({
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id],
  }),
}));

export type Folder = typeof folders.$inferSelect;
export type File = typeof files.$inferSelect;
export type NewFolder = Omit<typeof folders.$inferInsert, 'path'> & { path?: string };
export type NewFile = Omit<typeof files.$inferInsert, 'path'> & { path?: string };
