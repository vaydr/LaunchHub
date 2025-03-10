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
import { Mail, Linkedin, Instagram, Phone, Plus, X, ThumbsUp, ThumbsDown, ChevronsUp, ChevronsDown, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Contact } from "@shared/schema";
import { ContactInfo } from "@/components/ContactIcon";
import DetailedContactInfo from "@/components/DetailedInfo";
import { relationshipTags } from "@/components/TagComponent";
import React from "react";

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

  // Add a function to get the rating based on interaction strength
  const getRelationshipRating = (strength: number | null): number => {
    if (strength === null) return 0;
    
    // Convert to a scale of 0-10 if not already
    const normalizedStrength = strength > 10 ? strength / 10 : strength;
    
    // Define thresholds for the 5 buckets
    if (normalizedStrength <= 2) return -2; // Very Poor
    if (normalizedStrength <= 4) return -1; // Poor
    if (normalizedStrength <= 6) return 0;  // Fair
    if (normalizedStrength <= 8) return 1;  // Good
    return 2; // Very Good
  };

  // Add a function to get color based on rating
  const getRatingColor = (rating: number): string => {
    switch (rating) {
      case -2: return "text-red-600";
      case -1: return "text-red-400";
      case 0: return "text-amber-500";
      case 1: return "text-green-400";
      case 2: return "text-green-600";
      default: return "text-gray-400";
    }
  };

  // Add a function to get background color for the bar
  const getRatingBgColor = (rating: number): string => {
    switch (rating) {
      case -2: return "bg-red-600";
      case -1: return "bg-red-400";
      case 0: return "bg-amber-500";
      case 1: return "bg-green-400";
      case 2: return "bg-green-600";
      default: return "bg-gray-400";
    }
  };

  // Add a function to get the appropriate icon
  const getRatingIcon = (rating: number) => {
    switch (rating) {
      case -2: return (
        <div className="relative flex items-center justify-center w-6 h-6">
          <ThumbsDown className="h-4 w-4 text-red-600 absolute -top-0.5 -left-0.5" />
          <ThumbsDown className="h-4 w-4 text-red-600 absolute -bottom-0.5 -right-0.5" />
        </div>
      );
      case -1: return <ThumbsDown className="h-5 w-5 text-red-400" />;
      case 0: return <ThumbsDown className="h-5 w-5 text-amber-500 transform rotate-90" />;
      case 1: return <ThumbsUp className="h-5 w-5 text-green-400" />;
      case 2: return (
        <div className="relative flex items-center justify-center w-6 h-6">
          <ThumbsUp className="h-4 w-4 text-green-600 absolute -top-0.5 -left-0.5" />
          <ThumbsUp className="h-4 w-4 text-green-600 absolute -bottom-0.5 -right-0.5" />
        </div>
      );
      default: return <Minus className="h-5 w-5 text-gray-400" />;
    }
  };

  // Update the RatingTooltip component to use useMemo for stable scores
  const RatingTooltip = ({ contact }: { contact: Contact }) => {
    // Generate scores for the three categories using useMemo to prevent regeneration on every render
    // We'll use the contact ID as a dependency to ensure scores only change when the contact changes
    const scores = React.useMemo(() => {
      // Seed the random generator with the contact ID to get consistent results for the same contact
      const getSeededRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      
      // Use the contact ID to seed the random generator
      const seed = contact.id;
      const baseScore = Number(contact.interactionStrength || 5);
      
      // Generate scores that are influenced by the overall score but still have some variation
      return {
        frequency: Math.min(10, Math.max(0, baseScore + (getSeededRandom(seed) * 4 - 2))).toFixed(2),
        semantics: Math.min(10, Math.max(0, baseScore + (getSeededRandom(seed + 1) * 4 - 2))).toFixed(2),
        referral: Math.min(10, Math.max(0, baseScore + (getSeededRandom(seed + 2) * 4 - 2))).toFixed(2)
      };
    }, [contact.id, contact.interactionStrength]);
    
    // Get rating and color for each score
    const getScoreRating = (score: number) => getRelationshipRating(score);
    const getScoreColor = (score: number) => getRatingColor(getScoreRating(score));
    
    return (
      <div className="absolute z-100 -top-2 left-10 bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 w-56">
        <div className="space-y-2">
          <h4 className="font-medium text-sm mb-2">Relationship Factors</h4>
          
          <div className="space-y-2">
            {/* Frequency Score */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Frequency:</span>
              <div className="flex items-center gap-1">
                <span className={`font-medium ${getScoreColor(parseFloat(scores.frequency))}`}>
                  {scores.frequency}
                </span>
                <span className="text-xs text-gray-500">/10</span>
              </div>
            </div>
            
            {/* Semantics Score */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Semantics:</span>
              <div className="flex items-center gap-1">
                <span className={`font-medium ${getScoreColor(parseFloat(scores.semantics))}`}>
                  {scores.semantics}
                </span>
                <span className="text-xs text-gray-500">/10</span>
              </div>
            </div>
            
            {/* Referral Score */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Referral:</span>
              <div className="flex items-center gap-1">
                <span className={`font-medium ${getScoreColor(parseFloat(scores.referral))}`}>
                  {scores.referral}
                </span>
                <span className="text-xs text-gray-500">/10</span>
              </div>
            </div>
          </div>
          
          <div className="pt-2 mt-1 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Overall:</span>
              <div className="flex items-center gap-1">
                <span className={`font-medium ${getRatingColor(getRelationshipRating(contact.interactionStrength))}`}>
                  {contact.interactionStrength?.toFixed(2) || "0.0"}
                </span>
                <span className="text-xs text-gray-500">/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
            <TableHead className="text-center">Name</TableHead>
            <TableHead className="text-center">Relationship</TableHead>
            <TableHead className="text-center">Tags</TableHead>
            <TableHead className="text-center">Contact</TableHead>
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
                className="font-medium text-center"
                onClick={() => handleContactClick(contact)}
              >
                {contact.name}
              </TableCell>
              <TableCell onClick={() => handleContactClick(contact)}>
                <div className="flex items-center justify-center pl-0">
                  {/* Rating icon - moved left */}
                  <div className="flex-shrink-0 flex justify-center items-center mr-2 relative group">
                    {getRatingIcon(getRelationshipRating(contact.interactionStrength))}
                    
                    {/* Tooltip that appears on hover */}
                    <div className="hidden group-hover:block">
                      <RatingTooltip contact={contact} />
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    {/* Strength value with color */}
                    <div className="flex items-center gap-1">
                      <span className={`font-medium ${getRatingColor(getRelationshipRating(contact.interactionStrength))}`}>
                        {contact.interactionStrength?.toFixed(2) || "0.0"}
                      </span>
                      <span className="text-sm text-gray-500">/ 10</span>
                    </div>
                    
                    {/* Visual bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full ${getRatingBgColor(getRelationshipRating(contact.interactionStrength))}`} 
                        style={{ 
                          width: `${Math.min(100, contact.interactionStrength ? contact.interactionStrength * 10 : 0)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell onClick={() => handleContactClick(contact)}>
                <div className="flex flex-wrap gap-1 justify-center">
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
              <TableCell className="flex justify-center">
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