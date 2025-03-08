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
    const mockContacts: InsertContact[] = [
      {
        name: "John Smith",
        kerberos: "jsmith",
        email: "jsmith@mit.edu",
        department: "EECS",
        year: 2024,
        role: "Graduate Student",
        contactMethods: {
          phone: "617-555-0123",
          slack: "@jsmith",
          office: "32-D463"
        },
        notes: "Working on distributed systems research",
        interactionStrength: 8
      },
      {
        name: "Alice Johnson",
        kerberos: "ajohnson",
        email: "ajohnson@mit.edu",
        department: "Biology",
        year: 2025,
        role: "Undergraduate",
        contactMethods: {
          slack: "@alice"
        },
        notes: "UROP student in synthetic biology lab",
        interactionStrength: 5
      }
    ];

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