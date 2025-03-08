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

    // Generate clusters of people who are more likely to be connected
    const clusters = departments.map(dept => ({
      department: dept,
      members: new Set<number>()
    }));

    const mockContacts: InsertContact[] = Array.from({ length: 200 }, (_, i) => {
      const id = i + 1;
      const department = departments[Math.floor(Math.random() * departments.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const year = role === 'Undergraduate' ? years[Math.floor(Math.random() * years.length)] : years[0];

      // Add to department cluster
      const cluster = clusters.find(c => c.department === department);
      if (cluster) {
        cluster.members.add(id);
      }

      // Generate realistic name
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;

      // Generate realistic kerberos (first letter of first name + up to 7 chars of last name)
      const kerberos = (firstName[0] + lastName).toLowerCase().slice(0, 8);

      // Generate more realistic room numbers based on MIT building numbers
      const buildingNum = Math.floor(Math.random() * 38) + 1;
      const roomNum = Math.floor(Math.random() * 999);
      const office = `${buildingNum}-${String(roomNum).padStart(3, '0')}`;

      // Generate research interests based on department
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

      // Everyone has all contact methods
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
        connections: [] // Will be populated after all contacts are created
      };
    });

    // Create all contacts first
    mockContacts.forEach(contact => this.createContact(contact));

    // Now generate connections
    // People are more likely to be connected to others in their department and year
    this.contacts.forEach((contact) => {
      const connections = new Set<number>();
      const sameCluster = clusters.find(c => c.department === contact.department)?.members || new Set();

      // Add 3-8 connections within same department (60% chance)
      Array.from(sameCluster).forEach(otherId => {
        if (otherId !== contact.id && Math.random() < 0.2 && connections.size < 8) {
          connections.add(otherId);
        }
      });

      // Then add 1-4 random connections from other departments
      while (connections.size < 4 + Math.floor(Math.random() * 4)) {
        const randomId = Math.floor(Math.random() * 200) + 1;
        if (randomId !== contact.id && !sameCluster.has(randomId)) {
          connections.add(randomId);
        }
      }

      // Update the contact with connections
      this.updateContact(contact.id, {
        ...contact,
        connections: Array.from(connections)
      });

      // Add reciprocal connections
      connections.forEach(targetId => {
        const targetContact = this.contacts.get(targetId);
        if (targetContact && !targetContact.connections.includes(contact.id)) {
          this.updateContact(targetId, {
            ...targetContact,
            connections: [...targetContact.connections, contact.id]
          });
        }
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

    // Return all results for client-side pagination
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