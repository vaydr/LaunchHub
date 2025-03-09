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
  notes: text("notes"),
  interactionStrength: integer("interaction_strength").default(0),
  lastInteraction: timestamp("last_interaction"),
  connections: jsonb("connections").$type<number[]>().default([]),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  lastInteraction: true
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

// Network graph types
export interface NetworkNode {
  id: number;
  name: string;
  department: string;
  year?: number;
  group: string;
  // Force graph simulation adds these properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  index?: number;
}

export interface NetworkLink {
  source: number;
  target: number;
  value: number;
}

export interface NetworkGraph {
  nodes: NetworkNode[];
  links: NetworkLink[];
}