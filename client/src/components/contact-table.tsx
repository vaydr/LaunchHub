import { useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Mail, Linkedin, Instagram, Phone, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Contact } from "@shared/schema";
import { ContactInfo } from "@/components/ContactIcon";
import DetailedContactInfo from "@/components/DetailedInfo";
import { relationshipTags } from "@/components/DetailedInfo";

interface ContactTableProps {
  contacts: Contact[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  onPageChange: (page: number) => void;
  onFilterConnections: (id: number) => void;
  activeConnectionFilter: number | null;
}

export default function ContactTable({
  contacts,
  isLoading,
  currentPage,
  totalPages,
  totalEntries,
  onPageChange,
  onFilterConnections,
  activeConnectionFilter
}: ContactTableProps) {
  const [_, setLocation] = useLocation();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactsData, setContactsData] = useState<Contact[]>(contacts);

  useEffect(() => {
    setContactsData(contacts);
  }, [contacts]);

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedContact(null);
  };

  const handleSaveContact = (updatedContact: Contact) => {
    const updatedContacts = contactsData.map(contact => 
      contact.id === updatedContact.id ? updatedContact : contact
    );
    setContactsData(updatedContacts);
  };

  // Get color for a tag - copied from DetailedInfo.tsx
  const getTagColor = (tagName: string) => {
    const tag = relationshipTags.find(t => t.name === tagName);
    return tag ? tag.color : "bg-purple-100 text-purple-800"; // Default color
  };

  if (isLoading) {
    return <div>Loading contacts...</div>;
  }
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Relationship</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contactsData.map((contact) => (
            <TableRow
              key={contact.id}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell onClick={() => handleContactClick(contact)}>
                <img src={contact.picture || ''} alt={contact.name} className="w-10 h-10 rounded-full" />
              </TableCell>
              <TableCell
                className="font-medium"
                onClick={() => handleContactClick(contact)}
              >
                {contact.name}
              </TableCell>
              <TableCell onClick={() => handleContactClick(contact)}>
                Strength {contact.interactionStrength?.toFixed(2)} relationship.
              </TableCell>
              <TableCell onClick={() => handleContactClick(contact)}>
                <div className="flex flex-wrap gap-1">
                  {contact.tags && contact.tags.length > 0 ? (
                    contact.tags.map((tag) => (
                      <span key={tag} className={`px-1.5 py-0.5 ${getTagColor(tag)} text-xs rounded-full`}>
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No tags</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <ContactInfo 
                  email={contact.email}
                  linkedin={contact.linkedin}
                  instagram={contact.instagram}
                  phone={contact.phone}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedContact && (
        <DetailedContactInfo 
          key={selectedContact.id}
          contact={selectedContact}
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSaveContact}
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex flex-col items-center">
            <span className="flex items-center text-sm">
              {currentPage} / {totalPages}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {totalEntries} total {totalEntries === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}