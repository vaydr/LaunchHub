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
        interactionStrength: 8,
        connections: [2, 3, 4, 8, 11, 14] // Added more connections
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
        interactionStrength: 5,
        connections: [1, 3, 7, 9, 14, 15] // Added more connections
      },
      {
        name: "David Chen",
        kerberos: "dchen",
        email: "dchen@mit.edu",
        department: "EECS",
        year: 2025,
        role: "Undergraduate",
        contactMethods: {
          phone: "617-555-0234",
          slack: "@dchen"
        },
        notes: "Active in IEEE student chapter",
        interactionStrength: 3,
        connections: [1, 2, 8, 11, 12] // Added more connections
      },
      {
        name: "Maria Rodriguez",
        kerberos: "mrodrig",
        email: "mrodrig@mit.edu",
        department: "Physics",
        year: 2024,
        role: "Graduate Student",
        contactMethods: {
          slack: "@mrodrig",
          office: "13-3054"
        },
        notes: "Quantum computing research group",
        interactionStrength: 6,
        connections: [5, 10]
      },
      {
        name: "Professor Sarah Lee",
        kerberos: "slee",
        email: "slee@mit.edu",
        department: "Mathematics",
        year: null,
        role: "Professor",
        contactMethods: {
          phone: "617-555-0345",
          office: "2-365"
        },
        notes: "Teaching 18.06 Linear Algebra",
        interactionStrength: 7,
        connections: [1, 6, 12]
      },
      {
        name: "James Wilson",
        kerberos: "jwilson",
        email: "jwilson@mit.edu",
        department: "Chemistry",
        year: 2026,
        role: "Undergraduate",
        contactMethods: {
          slack: "@jwilson"
        },
        notes: "Chemistry Club President",
        interactionStrength: 4,
        connections: [4, 13]
      },
      {
        name: "Emily Brown",
        kerberos: "ebrown",
        email: "ebrown@mit.edu",
        department: "Biology",
        year: 2024,
        role: "Research Scientist",
        contactMethods: {
          phone: "617-555-0456",
          office: "68-580"
        },
        notes: "Leading cancer research project",
        interactionStrength: 9,
        connections: [2, 8, 14]
      },
      {
        name: "Michael Zhang",
        kerberos: "mzhang",
        email: "mzhang@mit.edu",
        department: "EECS",
        year: 2027,
        role: "Undergraduate",
        contactMethods: {
          slack: "@mzhang"
        },
        notes: "Interested in machine learning",
        interactionStrength: 2,
        connections: [1, 3, 11]
      },
      {
        name: "Dr. Robert Taylor",
        kerberos: "rtaylor",
        email: "rtaylor@mit.edu",
        department: "Mechanical Engineering",
        year: null,
        role: "Professor",
        contactMethods: {
          phone: "617-555-0567",
          office: "3-137",
          slack: "@rtaylor"
        },
        notes: "Robotics lab director",
        interactionStrength: 8,
        connections: [9, 12, 15]
      },
      {
        name: "Sofia Patel",
        kerberos: "spatel",
        email: "spatel@mit.edu",
        department: "Mathematics",
        year: 2025,
        role: "Graduate Student",
        contactMethods: {
          slack: "@spatel",
          office: "2-333"
        },
        notes: "Research in topology",
        interactionStrength: 5,
        connections: [4, 14, 16]
      },
      {
        name: "Lucas Kim",
        kerberos: "lkim",
        email: "lkim@mit.edu",
        department: "Physics",
        year: 2026,
        role: "Undergraduate",
        contactMethods: {
          phone: "617-555-0678"
        },
        notes: "Physics Olympiad mentor",
        interactionStrength: 6,
        connections: [3, 10, 15]
      },
      {
        name: "Professor Emma Davis",
        kerberos: "edavis",
        email: "edavis@mit.edu",
        department: "EECS",
        year: null,
        role: "Professor",
        contactMethods: {
          phone: "617-555-0789",
          office: "32-G492",
          slack: "@edavis"
        },
        notes: "AI Ethics research group",
        interactionStrength: 9,
        connections: [1, 3, 8, 17]
      },
      {
        name: "Thomas Anderson",
        kerberos: "tanders",
        email: "tanders@mit.edu",
        department: "Chemistry",
        year: 2024,
        role: "Graduate Student",
        contactMethods: {
          slack: "@tanders",
          office: "18-090"
        },
        notes: "Materials chemistry research",
        interactionStrength: 4,
        connections: [6, 13]
      },
      {
        name: "Olivia Wang",
        kerberos: "owang",
        email: "owang@mit.edu",
        department: "Biology",
        year: 2027,
        role: "Undergraduate",
        contactMethods: {
          slack: "@owang"
        },
        notes: "Synthetic biology club member",
        interactionStrength: 3,
        connections: [2, 7, 10]
      },
      {
        name: "Dr. Alexander Green",
        kerberos: "agreen",
        email: "agreen@mit.edu",
        department: "Mathematics",
        year: null,
        role: "Research Scientist",
        contactMethods: {
          phone: "617-555-0890",
          office: "2-245"
        },
        notes: "Number theory specialist",
        interactionStrength: 7,
        connections: [5, 14, 16]
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