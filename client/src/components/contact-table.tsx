import { useState } from "react";
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
import { Share2 } from "lucide-react";
import type { Contact } from "@shared/schema";

interface ContactTableProps {
  contacts: Contact[];
  isLoading: boolean;
  onFilterConnections: (id: number | null) => void;
  activeConnectionFilter: number | null;
}

const ITEMS_PER_PAGE = 10;

export default function ContactTable({
  contacts,
  isLoading,
  onFilterConnections,
  activeConnectionFilter
}: ContactTableProps) {
  const [_, setLocation] = useLocation();
  const [page, setPage] = useState(1);

  if (isLoading) {
    return <div>Loading contacts...</div>;
  }

  // Apply connection filter if active
  const filteredContacts = activeConnectionFilter
    ? contacts.filter(contact => {
        const activePerson = contacts.find(c => c.id === activeConnectionFilter);
        return activePerson?.connections.includes(contact.id);
      })
    : contacts;

  // Calculate pagination
  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);

  // Reset page if it's beyond the total
  if (page > totalPages) {
    setPage(1);
    return null; // Return null to prevent rendering with invalid page
  }

  // Get current page's contacts
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const displayContacts = filteredContacts.slice(start, end);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Kerberos</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Connections</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayContacts.map((contact) => (
            <TableRow
              key={contact.id}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell
                className="font-medium"
                onClick={() => setLocation(`/contact/${contact.id}`)}
              >
                {contact.name}
              </TableCell>
              <TableCell>{contact.kerberos}</TableCell>
              <TableCell>{contact.department}</TableCell>
              <TableCell>{contact.year}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-mono"
                  onClick={() => onFilterConnections(
                    activeConnectionFilter === contact.id ? null : contact.id
                  )}
                >
                  <Share2 
                    className={`h-4 w-4 mr-2 ${
                      activeConnectionFilter === contact.id ? 'text-primary' : ''
                    }`}
                  />
                  {contact.connections.length}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span>
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}