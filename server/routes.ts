import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchParamsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all contacts with search/filter
  app.get("/api/contacts", async (req, res) => {
    try {
      // Parse array parameters
      const departments = req.query.departments ? 
        (Array.isArray(req.query.departments) ? req.query.departments : [req.query.departments]) as string[] : 
        undefined;

      const years = req.query.years ? 
        (Array.isArray(req.query.years) ? req.query.years : [req.query.years])
          .map(y => parseInt(y as string))
          .filter(y => !isNaN(y)) :
        undefined;

      const params = searchParamsSchema.parse({
        query: req.query.query as string,
        departments,
        department: req.query.department as string,
        years,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      });

      const contacts = await storage.searchContacts(params);
      res.json(contacts);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid search parameters" });
        return;
      }
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // Get single contact
  app.get("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.getContact(id);

      if (!contact) {
        res.status(404).json({ message: "Contact not found" });
        return;
      }

      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  // Update contact
  app.patch("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      const contact = await storage.updateContact(id, updates);
      res.json(contact);
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}