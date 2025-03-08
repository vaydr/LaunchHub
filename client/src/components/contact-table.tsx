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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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
    return <div>Loading...</div>;
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
          {contacts && contacts.length > 0 ? contacts.map((contact) => {
            const isActive = activeConnectionFilter === contact.id;

            return (
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
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-mono"
                        onClick={() => onFilterConnections(contact.id)}
                      >
                        <Share2 className={`h-4 w-4 mr-2 ${isActive ? 'text-primary' : ''}`} />
                        {contact.connections?.length || 0}
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">Connected to:</h4>
                        <div className="text-sm text-muted-foreground">
                          {contact.connections && contact.connections.length > 0 ? (
                            contact.connections.map(id => {
                              const connectedContact = contacts.find(c => c.id === id);
                              return connectedContact ? (
                                <div key={id} className="py-1">
                                  {connectedContact.name}
                                </div>
                              ) : null;
                            })
                          ) : (
                            <div className="py-1">No connections</div>
                          )}
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </TableCell>
              </TableRow>
            );
          }) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">No contacts found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
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