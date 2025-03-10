import { useState, useMemo, useEffect } from "react";
import type { Contact } from "@shared/schema";

interface UsePaginationProps {
  contacts: Contact[];
  itemsPerPage: number;
  activeConnectionFilter: number | null;
}

interface UsePaginationResult {
  paginatedContacts: Contact[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalEntries: number;
}

export default function usePagination({
  contacts,
  itemsPerPage,
  activeConnectionFilter
}: UsePaginationProps): UsePaginationResult {
  const [currentPage, setCurrentPage] = useState(1);

  // Single source of truth for filtered contacts and pagination
  const { paginatedContacts, totalPages, adjustedCurrentPage, totalEntries } = useMemo(() => {
    // Apply connection filter if active
    const filtered = activeConnectionFilter 
      ? contacts.filter((contact: Contact) => {
          const activePerson = contacts.find((c: Contact) => c.id === activeConnectionFilter);
          // Check if the contact is connected to the active person
          // Assuming connections is an array of IDs in the Contact type
          return activePerson && 'connections' in activePerson && 
            Array.isArray(activePerson.connections) && 
            activePerson.connections.includes(contact.id);
        })
      : contacts;

    // Calculate total pages
    const total = Math.ceil(filtered.length / itemsPerPage);

    // Ensure current page is valid for the filtered set
    const adjustedPage = Math.min(currentPage, total || 1);

    // Calculate slice indices based on adjusted page
    const start = (adjustedPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);

    return {
      paginatedContacts: paginated,
      totalPages: total,
      adjustedCurrentPage: adjustedPage,
      totalEntries: filtered.length
    };
  }, [contacts, activeConnectionFilter, currentPage, itemsPerPage]);

  // If the adjusted page is different from current page, update it
  useEffect(() => {
    if (adjustedCurrentPage !== currentPage) {
      setCurrentPage(adjustedCurrentPage);
    }
  }, [adjustedCurrentPage, currentPage]);

  return {
    paginatedContacts,
    totalPages,
    currentPage: adjustedCurrentPage,
    setCurrentPage,
    totalEntries
  };
} 