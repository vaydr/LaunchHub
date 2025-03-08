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
    const mockContacts: InsertContact[] = Array.from({ length: 200 }, (_, i) => {
      const id = i + 1;
      const department = departments[Math.floor(Math.random() * departments.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const year = role === 'Undergraduate' ? years[Math.floor(Math.random() * years.length)] : undefined;

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      const kerberos = (firstName[0] + lastName).toLowerCase().slice(0, 8);

      const buildingNum = Math.floor(Math.random() * 38) + 1;
      const roomNum = Math.floor(Math.random() * 999);
      const office = `${buildingNum}-${String(roomNum).padStart(3, '0')}`;

      const researchAreas = {
        'EECS': ['Artificial Intelligence', 'Computer Systems', 'Robotics', 'Computer Security', 'Machine Learning'],
        'Biology': ['Synthetic Biology', 'Neuroscience', 'Genetics', 'Cell Biology', 'Systems Biology'],
        'Physics': ['Quantum Computing', 'Particle Physics', 'Astrophysics', 'Condensed Matter', 'Nuclear Physics'],
        'Mathematics': ['Number Theory', 'Topology', 'Applied Mathematics', 'Statistical Learning', 'Combinatorics'],
        'Chemistry': ['Organic Chemistry', 'Materials Science', 'Physical Chemistry', 'Biochemistry', 'Inorganic Chemistry'],
        'Mechanical Engineering': ['Robotics', 'Fluid Dynamics', 'Thermodynamics', 'Control Systems', 'Manufacturing']
      };

      const areas = researchAreas[department];
      const researchArea = areas[Math.floor(Math.random() * areas.length)];

      return {
        name,
        kerberos,
        email: `${kerberos}@mit.edu`,
        department,
        year,
        role,
        contactMethods: {
          phone: `617-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          slack: `@${kerberos}`,
          office,
        },
        notes: `Research interests in ${researchArea}`,
        interactionStrength: Math.floor(Math.random() * 10),
        connections: []
      };
    });

    // Create all contacts first
    mockContacts.forEach(contact => this.createContact(contact));

    // Then establish connections
    const connectionMap = new Map<number, Set<number>>();

    // Initialize empty sets for all contacts
    for (let i = 1; i <= 200; i++) {
      connectionMap.set(i, new Set());
    }

    // Helper to add a bidirectional connection
    const addConnection = (id1: number, id2: number) => {
      connectionMap.get(id1)?.add(id2);
      connectionMap.get(id2)?.add(id1);
    };

    // For each contact, add 3-8 connections
    for (let id = 1; id <= 200; id++) {
      const contact = this.contacts.get(id)!;
      const desiredConnections = 3 + Math.floor(Math.random() * 6); // 3-8 connections

      // Prefer connections within same department (higher probability)
      const departmentContacts = Array.from(this.contacts.values())
        .filter(c => c.id !== id && c.department === contact.department);

      // Add department connections first (if available)
      for (const deptContact of departmentContacts) {
        if (connectionMap.get(id)!.size >= desiredConnections) break;
        if (Math.random() < 0.4) { // 40% chance to connect with department colleague
          addConnection(id, deptContact.id);
        }
      }

      // If still need more connections, add random ones
      while (connectionMap.get(id)!.size < desiredConnections) {
        const randomId = 1 + Math.floor(Math.random() * 200);
        if (randomId !== id && !connectionMap.get(id)!.has(randomId)) {
          addConnection(id, randomId);
        }
      }
    }

    // Update all contacts with their final connections
    connectionMap.forEach((connections, id) => {
      this.updateContact(id, {
        connections: Array.from(connections)
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
    } else if (params.department) {
      results = results.filter(contact =>
        contact.department === params.department
      );
    }

    if (params.years && params.years.length > 0) {
      results = results.filter(contact =>
        contact.year && params.years!.includes(contact.year)
      );
    } else if (params.year) {
      results = results.filter(contact =>
        contact.year === params.year
      );
    }

    // Sort by name for consistent ordering
    results.sort((a, b) => a.name.localeCompare(b.name));

    return results;
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.currentId++;
    const now = new Date();
    const newContact: Contact = {
      ...contact,
      id,
      lastInteraction: now,
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