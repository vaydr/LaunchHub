import { contacts, type Contact, type InsertContact } from "@shared/schema";
import type { SearchParams } from "@shared/schema";
import { faker } from '@faker-js/faker';

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
    const departments = ['EECS', 'Biology', 'Physics', 'Mathematics', 'Chemistry', 'Mechanical Engineering'];
    const roles = ['Undergraduate', 'Graduate Student', 'Professor', 'Research Scientist', 'Postdoc'];
    const years = [2024, 2025, 2026, 2027];

    // First create all contacts without connections
    for (let i = 0; i < 200; i++) {
      const id = i + 1;
      const department = departments[Math.floor(Math.random() * departments.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const year = role === 'Undergraduate' ? years[Math.floor(Math.random() * years.length)] : undefined;

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      const kerberos = (firstName[0] + lastName).toLowerCase().slice(0, 8);

      this.contacts.set(id, {
        id,
        name,
        kerberos,
        email: `${kerberos}@mit.edu`,
        department,
        year,
        role,
        contactMethods: {
          phone: faker.phone.number('617-###-####'),
          slack: `@${kerberos}`,
          office: `${Math.floor(Math.random() * 38) + 1}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
        },
        notes: `Research interests in ${department}`,
        interactionStrength: 0,
        lastInteraction: new Date(),
        connections: []
      });
    }

    // Create a map to store all connections before applying them
    const connections = new Map<number, Set<number>>();
    for (let i = 1; i <= 200; i++) {
      connections.set(i, new Set());
    }

    // Add 5-8 random connections for each contact
    for (let i = 1; i <= 200; i++) {
      const numConnections = 5 + Math.floor(Math.random() * 4);
      const contact = this.contacts.get(i)!;

      // Get potential connections (prefer same department)
      const sameDept = Array.from(this.contacts.values())
        .filter(c => c.id !== i && c.department === contact.department)
        .map(c => c.id);

      const others = Array.from(this.contacts.values())
        .filter(c => c.id !== i && c.department !== contact.department)
        .map(c => c.id);

      // Shuffle both arrays
      sameDept.sort(() => Math.random() - 0.5);
      others.sort(() => Math.random() - 0.5);

      // Add connections, prioritizing same department
      let added = 0;

      // Add same department connections (try to add 60% from same dept)
      const targetSameDept = Math.min(Math.floor(numConnections * 0.6), sameDept.length);
      for (let j = 0; j < targetSameDept && added < numConnections; j++) {
        const otherId = sameDept[j];
        connections.get(i)!.add(otherId);
        connections.get(otherId)!.add(i);
        added++;
      }

      // Fill remaining with others
      for (let j = 0; added < numConnections && j < others.length; j++) {
        const otherId = others[j];
        connections.get(i)!.add(otherId);
        connections.get(otherId)!.add(i);
        added++;
      }
    }

    // Update all contacts with their connections
    connections.forEach((connectionSet, id) => {
      const contact = this.contacts.get(id)!;
      this.contacts.set(id, {
        ...contact,
        connections: Array.from(connectionSet)
      });
    });
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

    if (params.departments && params.departments.length > 0) {
      results = results.filter(contact =>
        params.departments!.includes(contact.department)
      );
    }

    if (params.years && params.years.length > 0) {
      results = results.filter(contact =>
        contact.year && params.years!.includes(contact.year)
      );
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.currentId++;
    const newContact: Contact = {
      ...contact,
      id,
      lastInteraction: new Date(),
      connections: []
    };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact> {
    const contact = await this.getContact(id);
    if (!contact) {
      throw new Error("Contact not found");
    }

    const updatedContact = {
      ...contact,
      ...updates,
      id
    };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }
}

export const storage = new MemStorage();