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
    const departments = ['EECS', 'Biology', 'Physics', 'Mathematics', 'Chemistry', 'MechE', 'Economics'];
    const roles = ['Undergraduate', 'Graduate Student', 'Professor', 'Research Scientist', 'Postdoc'];
    const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

    // First create all contacts without any connections
    for (let i = 0; i < 250; i++) {
      const id = i + 1;
      const department = departments[Math.floor(Math.random() * departments.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const year = role === 'Undergraduate' || role === 'Graduate Student' || role === 'Postdoc' ? years[Math.floor(Math.random() * years.length)] : undefined;

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
        year: year ?? null,
        role,
        notes: `Research interests in ${department}`,
        interactionStrength: 0,
        lastInteraction: new Date(),
        connections: []
      });
    }

    // Now add connections, ensuring they are bidirectional
    const addConnection = (id1: number, id2: number) => {
      const contact1 = this.contacts.get(id1)!;
      const contact2 = this.contacts.get(id2)!;

      // Add bidirectional connection
      if (!contact1.connections) {
        contact1.connections = [];
      }
      if (!contact2.connections) {
        contact2.connections = [];
      }
      
      if (!contact1.connections.includes(id2)) {
        contact1.connections.push(id2);
        this.contacts.set(id1, contact1);
      }
      if (!contact2.connections.includes(id1)) {
        contact2.connections.push(id1);
        this.contacts.set(id2, contact2);
      }
    };

    // Create connections with 10% probability
    const contactIds = Array.from(this.contacts.keys());
    
    for (let i = 0; i < contactIds.length; i++) {
      for (let j = i + 1; j < contactIds.length; j++) {
        // 10% chance of creating a connection
        if (Math.random() < 0.1) {
          addConnection(contactIds[i], contactIds[j]);
        }
      }
    }
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
      year: contact.year ?? null,
      lastInteraction: new Date(),
      connections: [],
      notes: contact.notes ?? null,
      interactionStrength: contact.interactionStrength ?? 0,
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