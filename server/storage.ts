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

    // First create all contacts
    for (let i = 0; i < 200; i++) {
      const id = i + 1;
      const department = departments[Math.floor(Math.random() * departments.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const year = role === 'Undergraduate' ? years[Math.floor(Math.random() * years.length)] : undefined;

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      const kerberos = (firstName[0] + lastName).toLowerCase().slice(0, 8);

      const office = `${Math.floor(Math.random() * 38) + 1}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;

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
          office,
        },
        notes: `Research interests in ${department}`,
        interactionStrength: 0,
        lastInteraction: new Date(),
        connections: []
      });
    }

    // Now add connections
    const addConnection = (id1: number, id2: number) => {
      const contact1 = this.contacts.get(id1)!;
      const contact2 = this.contacts.get(id2)!;

      // Add bidirectional connection if it doesn't exist
      if (!contact1.connections.includes(id2)) {
        contact1.connections.push(id2);
      }
      if (!contact2.connections.includes(id1)) {
        contact2.connections.push(id1);
      }
    };

    // For each contact, add 5-10 connections
    Array.from(this.contacts.keys()).forEach(id => {
      const numConnections = 5 + Math.floor(Math.random() * 6);
      const contact = this.contacts.get(id)!;

      // Prioritize department connections (60% chance)
      const departmentContacts = Array.from(this.contacts.values())
        .filter(c => c.id !== id && c.department === contact.department);

      for (const deptContact of departmentContacts) {
        if (contact.connections.length >= numConnections) break;
        if (Math.random() < 0.6) {
          addConnection(id, deptContact.id);
        }
      }

      // Fill remaining slots with random connections
      while (contact.connections.length < numConnections) {
        const randomId = Math.floor(Math.random() * 200) + 1;
        if (randomId !== id && !contact.connections.includes(randomId)) {
          addConnection(id, randomId);
        }
      }
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