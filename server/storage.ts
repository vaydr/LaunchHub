import { contacts, type Contact, type InsertContact } from "@shared/schema";
import type { SearchParams } from "@shared/schema";

export interface IStorage {
  getContact(id: number): Promise<Contact | undefined>;
  searchContacts(params: SearchParams): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<Contact>): Promise<Contact>;
}

export class MemStorage implements IStorage {
  private contacts: Map<number, Contact>;
  private currentId: number;

  constructor() {
    this.contacts = new Map();
    this.currentId = 1;
    this.initializeMockData();
  }

  private initializeMockData() {
    // Generate 200 mock contacts
    const departments = ['EECS', 'Biology', 'Physics', 'Mathematics', 'Chemistry', 'Mechanical Engineering'];
    const roles = ['Undergraduate', 'Graduate Student', 'Professor', 'Research Scientist', 'Postdoc'];
    const years = [2024, 2025, 2026, 2027, null]; // null for faculty/staff

    const mockContacts: InsertContact[] = Array.from({ length: 200 }, (_, i) => {
      const id = i + 1;
      const department = departments[Math.floor(Math.random() * departments.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const year = role === 'Undergraduate' ? years[Math.floor(Math.random() * (years.length - 1))] : null;

      // Generate 10-20 random connections for each person
      const numConnections = 10 + Math.floor(Math.random() * 10);
      const connections = Array.from({ length: numConnections }, () =>
        1 + Math.floor(Math.random() * 200) // Random IDs from 1-200
      ).filter(connId => connId !== id); // Remove self-connections

      return {
        name: `Person ${id}`,
        kerberos: `person${id}`,
        email: `person${id}@mit.edu`,
        department,
        year,
        role,
        contactMethods: {
          phone: Math.random() > 0.5 ? `617-555-${String(1000 + id).padStart(4, '0')}` : undefined,
          slack: Math.random() > 0.5 ? `@person${id}` : undefined,
          office: Math.random() > 0.5 ? `${Math.floor(Math.random() * 38)}-${Math.floor(Math.random() * 999)}` : undefined
        },
        notes: Math.random() > 0.7 ? `Research interests in ${department} specializing in area ${Math.floor(Math.random() * 5) + 1}` : undefined,
        interactionStrength: Math.floor(Math.random() * 10),
        connections: Array.from(new Set(connections)) // Remove duplicates
      };
    });

    mockContacts.forEach(contact => this.createContact(contact));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async searchContacts(params: SearchParams): Promise<Contact[]> {
    let results = Array.from(this.contacts.values());

    if (params.query) {
      const query = params.query.toLowerCase();
      results = results.filter(contact =>
        contact.name.toLowerCase().includes(query) ||
        contact.kerberos.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query)
      );
    }

    // Support for multiple departments
    if (params.departments && params.departments.length > 0) {
      results = results.filter(contact =>
        params.departments!.includes(contact.department)
      );
    } else if (params.department) {
      // Backward compatibility for single department
      results = results.filter(contact =>
        contact.department === params.department
      );
    }

    // Support for multiple years
    if (params.years && params.years.length > 0) {
      results = results.filter(contact =>
        contact.year && params.years!.includes(contact.year)
      );
    } else if (params.year) {
      // Backward compatibility for single year
      results = results.filter(contact =>
        contact.year === params.year
      );
    }

    // Pagination
    const limit = params.limit || 10;
    const page = params.page || 1;
    const start = (page - 1) * limit;

    return results.slice(start, start + limit);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.currentId++;
    const now = new Date();
    const newContact: Contact = {
      ...contact,
      id,
      lastInteraction: now
    };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact> {
    const contact = await this.getContact(id);
    if (!contact) {
      throw new Error("Contact not found");
    }

    const updatedContact: Contact = {
      ...contact,
      ...updates,
      id
    };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }
}

export const storage = new MemStorage();