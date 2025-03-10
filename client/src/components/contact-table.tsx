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
import { Share2, Mail, Linkedin, Instagram, Phone, Copy, Check, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Contact } from "@shared/schema";

interface ContactInfoProps {
  email?: string;
  linkedin?: string | null;
  instagram?: string | null;
  phone?: string | null;
}

interface ContactIconProps {
  value: string | null | undefined;
  type: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  copied: string | null;
  onCopy: (text: string | undefined | null, type: string) => void;
}

function ContactIcon({ value, type, icon, activeIcon, copied, onCopy }: ContactIconProps) {
  const isActive = !!value;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          className={`p-1 rounded-full hover:bg-gray-100 ${isActive ? '' : 'opacity-50'}`}
          onClick={() => isActive ? onCopy(value, type) : null}
        >
          {copied === type ? activeIcon : icon}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{copied === type ? 'Copied!' : value || 'Not provided'}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function ContactInfo({ email, linkedin, instagram, phone }: ContactInfoProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string | undefined | null, type: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const renderIcon = (value: string | null | undefined, type: string, Icon: any) => {
    const isActive = !!value;
    return (
      <Icon className={`h-4 w-4 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
    );
  };

  return (
    <div className="flex space-x-2">
      <TooltipProvider>
        <ContactIcon
          value={email}
          type="email"
          icon={renderIcon(email, 'email', Mail)}
          activeIcon={<Check className="h-4 w-4 text-green-500" />}
          copied={copied}
          onCopy={copyToClipboard}
        />
        
        <ContactIcon
          value={linkedin}
          type="linkedin"
          icon={renderIcon(linkedin, 'linkedin', Linkedin)}
          activeIcon={<Check className="h-4 w-4 text-green-500" />}
          copied={copied}
          onCopy={copyToClipboard}
        />
        
        <ContactIcon
          value={instagram}
          type="instagram"
          icon={renderIcon(instagram, 'instagram', Instagram)}
          activeIcon={<Check className="h-4 w-4 text-green-500" />}
          copied={copied}
          onCopy={copyToClipboard}
        />
        
        <ContactIcon
          value={phone}
          type="phone"
          icon={renderIcon(phone, 'phone', Phone)}
          activeIcon={<Check className="h-4 w-4 text-green-500" />}
          copied={copied}
          onCopy={copyToClipboard}
        />
      </TooltipProvider>
    </div>
  );
}

interface DetailedContactInfoProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedContact: Contact) => void;
}

// Available relationship tags
const relationshipTags = [
  "Friend",
  "Classmate",
  "Groupmate",
  "Coworker",
  "Mentor",
  "Mentee",
  "Professor",
  "TA",
  "Advisor",
  "Lab Partner",
  "Club Member",
  "Research Collaborator"
];

function DetailedContactInfo({ contact, isOpen, onClose, onSave }: DetailedContactInfoProps) {
  const [notes, setNotes] = useState(contact.notes || "");
  const [tags, setTags] = useState<string[]>(contact.tags || []);
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  
  const handleSaveChanges = () => {
    const updatedContact = {
      ...contact,
      notes,
      tags
    };
    onSave(updatedContact);
    onClose();
  };
  
  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setIsTagPopoverOpen(false);
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="grid grid-cols-3 gap-6">
          {/* First Column - Profile Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-full overflow-hidden">
                <img 
                  src={contact.picture || "https://via.placeholder.com/150"} 
                  alt={contact.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{contact.name}</h2>
                <p className="text-gray-500">{contact.role} {contact.year ? `· ${contact.year}` : ""}</p>
              </div>
            </div>
            
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="mb-2">
                <span className="text-sm text-gray-500">
                  Interaction Strength: {((contact.interactionStrength || 0) / 10).toFixed(2)}/10
                </span>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, contact.interactionStrength ? contact.interactionStrength * 10 : 0)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Recent Interactions</span>
                <div className="text-sm mt-1 max-h-24 overflow-y-auto pr-1">
                  {contact.interactionSummary || "No recent interactions recorded."}
                </div>
              </div>
            </div>
          </div>
          
          {/* Second Column - Contact Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{contact.email}</span>
              </div>
              
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{contact.phone}</span>
                </div>
              )}
              
              {contact.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-gray-500" />
                  <span>{contact.linkedin}</span>
                </div>
              )}
              
              {contact.instagram && (
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-gray-500" />
                  <span>{contact.instagram}</span>
                </div>
              )}
            </div>
            
            <div className="bg-amber-50 p-3 rounded-lg mt-4">
              <h4 className="font-medium text-amber-800">Pending Actions</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span>2 unread messages</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span>Suggested: Schedule coffee chat</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Third Column - Actions and Notes */}
          <div className="space-y-4">
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <span className="mr-2">✨</span> Reach out to MEET
            </Button>
            
            <div>
              <h4 className="font-medium mb-2">Notes</h4>
              <textarea
                className="w-full p-2 border rounded-md text-sm max-h-32 min-h-[5rem]"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes here..."
                style={{ overflow: 'auto' }}
              />
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {contact.role}
                </span>
                {contact.year && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {contact.year}
                  </span>
                )}
                
                {tags.map((tag) => (
                  <div key={tag} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center">
                    {tag}
                    <button 
                      className="ml-1 text-purple-600 hover:text-purple-800"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button className="p-1 bg-gray-100 rounded-full hover:bg-gray-200">
                      <Plus className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2">
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {relationshipTags.map((tag) => (
                        <button
                          key={tag}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                          onClick={() => addTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="outline" className="mr-2">Cancel</Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </div>
      </div>
    </div>
  ) : null;
}

interface ContactTableProps {
  contacts: Contact[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onFilterConnections: (id: number) => void;
  activeConnectionFilter: number | null;
}

export default function ContactTable({
  contacts,
  isLoading,
  currentPage,
  totalPages,
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

  if (isLoading) {
    return <div>Loading contacts...</div>;
  }
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Picture</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Relationship</TableHead>
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
                <div className="flex flex-wrap gap-1">
                  {contact.tags && contact.tags.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                  {(!contact.tags || contact.tags.length === 0) && (
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
          contact={selectedContact}
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSaveContact}
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>
            {currentPage} / {totalPages}
          </span>
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