import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  kerberos: text("kerberos").notNull().unique(),
  email: text("email").notNull(),
  department: text("department").notNull(),
  year: integer("year"),
  role: text("role").notNull(),
  contactMethods: jsonb("contact_methods").$type<{
    phone?: string;
    slack?: string;
    office?: string;
  }>().notNull(),
  notes: text("notes"),
  interactionStrength: integer("interaction_strength").default(0),
  lastInteraction: timestamp("last_interaction"),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  lastInteraction: true
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Search params type
export const searchParamsSchema = z.object({
  query: z.string().optional(),
  department: z.string().optional(),
  year: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
