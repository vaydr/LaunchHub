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

  // Added function to generate mock data
  private generateMockData(count: number = 200): InsertContact[] {
    const departments = [
      "EECS", "Biology", "Physics", "Mathematics", "Chemistry",
      "Mechanical Engineering", "Aeronautics", "Materials Science",
      "Civil Engineering", "Nuclear Science"
    ];
    const roles = [
      "Undergraduate", "Graduate Student", "Professor", "Research Scientist",
      "PostDoc", "Lab Director", "Department Head", "Teaching Assistant"
    ];
    const years = [2024, 2025, 2026, 2027, 2028, null];

    const mockContacts: InsertContact[] = [];

    // Generate contacts
    for (let i = 1; i <= count; i++) {
      const department = departments[Math.floor(Math.random() * departments.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const year = role === "Professor" || role === "Research Scientist" ?
        null : years[Math.floor(Math.random() * years.length)];

      mockContacts.push({
        name: `Person ${i}`,
        kerberos: `person${i}`,
        email: `person${i}@mit.edu`,
        department,
        year,
        role,
        contactMethods: {
          ...(Math.random() > 0.5 && { phone: `617-555-${String(1000 + i).padStart(4, '0')}` }),
          ...(Math.random() > 0.3 && { slack: `@person${i}` }),
          ...(Math.random() > 0.7 && { office: `${Math.floor(Math.random() * 38)}-${Math.floor(Math.random() * 500)}` })
        },
        notes: Math.random() > 0.5 ? `Research interests in ${department} and related fields` : undefined,
        interactionStrength: Math.floor(Math.random() * 10),
        connections: [] // Will be filled after all contacts are created
      });
    }

    // Generate connections
    mockContacts.forEach((contact, idx) => {
      const numConnections = 5 + Math.floor(Math.random() * 15); // 5-20 connections per person
      const possibleConnections = new Set<number>();

      // Prefer connections within same department and role
      mockContacts.forEach((other, otherIdx) => {
        if (idx !== otherIdx && // No self-connections
            (other.department === contact.department || Math.random() > 0.7)) {
          possibleConnections.add(otherIdx + 1);
        }
      });

      const connections = Array.from(possibleConnections)
        .sort(() => Math.random() - 0.5)
        .slice(0, numConnections);

      contact.connections = connections;
    });

    return mockContacts;
  }

  constructor() {
    this.contacts = new Map();
    this.currentId = 1;
    this.generateMockData(200).forEach(contact => this.createContact(contact));
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