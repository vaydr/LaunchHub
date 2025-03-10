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
    for (let i = 0; i < 250; i++) {
      const id = i + 1;
      const department = departments[Math.floor(Math.random() * departments.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const year = role === 'Undergraduate' || role === 'Graduate Student' || role === 'Postdoc' ? years[Math.floor(Math.random() * years.length)] : undefined;

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      const kerberos = (firstName[0] + lastName).toLowerCase().slice(0, 8);
      const picture = faker.image.avatarGitHub();
      
      // Generate social media and contact info with 50% probability
      const hasLinkedin = Math.random() < 0.5;
      const hasInstagram = Math.random() < 0.5;
      const hasPhone = Math.random() < 0.5;

      const interactionSummary = faker.lorem.paragraph();
      const notes = faker.lorem.sentence();
      this.contacts.set(id, {
        id,
        name,
        kerberos,
        email: `${kerberos}@mit.edu`,
        year: year ?? null,
        role,
        notes,
        interactionStrength: (Math.random() * 10),
        interactionSummary,
        picture: picture,
        linkedin: hasLinkedin ? `https://www.linkedin.com/in/${kerberos}` : null,
        instagram: hasInstagram ? `https://www.instagram.com/${kerberos}` : null,
        phone: hasPhone ? faker.phone.number() : null,
        tags: [],
      });
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
        params.departments!.some(dept => contact.role.includes(dept))
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
      notes: contact.notes ?? null,
      interactionStrength: contact.interactionStrength ?? 0,
      interactionSummary: null,
      picture: null,
      linkedin: null,
      instagram: null,
      phone: null,
      tags: [],
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