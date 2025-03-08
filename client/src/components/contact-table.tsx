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

  if (isLoading) {
    return <div>Loading contacts...</div>;
  }

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
          {contacts.map((contact) => (
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
                  onClick={() => onFilterConnections(contact.id)}
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