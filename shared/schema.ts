import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  kerberos: text("kerberos").notNull().unique(),
  email: text("email").notNull(),
  year: integer("year"),
  role: text("role").notNull(),
  notes: text("notes"),
  interactionStrength: integer("interaction_strength").default(0),
  interactionSummary: text("interaction_summary"),
  picture: text("picture"),
  linkedin: text("linkedin"),
  instagram: text("instagram"),
  phone: text("phone"),
  tags: text("tags").array(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// Search params type with support for multiple departments and years
export const searchParamsSchema = z.object({
  query: z.string().optional(),
  department: z.string().optional(), // Keep for backward compatibility
  departments: z.array(z.string()).optional(),
  year: z.number().optional(), // Keep for backward compatibility
  years: z.array(z.number()).optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;