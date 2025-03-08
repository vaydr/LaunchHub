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
import { Share2, Star } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { Contact } from "@shared/schema";
import { useState } from "react";

interface ContactTableProps {
  contacts: Contact[];
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onFilterConnections: (connections: number[]) => void;
}

export default function ContactTable({
  contacts,
  isLoading,
  currentPage,
  onPageChange,
  onFilterConnections
}: ContactTableProps) {
  const [_, setLocation] = useLocation();
  const [expandedConnections, setExpandedConnections] = useState<number[]>([]);

  // Get names for a list of connection IDs
  const getConnectionNames = (connectionIds: number[]) => {
    return connectionIds
      .map(id => contacts.find(c => c.id === id))
      .filter(c => c !== undefined)
      .map(c => c!.name);
  };

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
            <TableHead>Interaction</TableHead>
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
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="font-mono"
                      onClick={() => {
                        if (expandedConnections.includes(contact.id)) {
                          setExpandedConnections(prev => prev.filter(id => id !== contact.id));
                        } else {
                          setExpandedConnections(prev => [...prev, contact.id]);
                          onFilterConnections(contact.connections || []);
                        }
                      }}
                    >
                      <Share2 className={`h-4 w-4 mr-2 ${expandedConnections.includes(contact.id) ? 'text-primary' : ''}`} />
                      {contact.connections?.length || 0}
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">Connected to:</h4>
                      <div className="text-sm text-muted-foreground">
                        {getConnectionNames(contact.connections || []).map((name, i) => (
                          <div key={i} className="py-1">{name}</div>
                        ))}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </TableCell>
              <TableCell>
                <Star
                  className={`h-4 w-4 ${
                    (contact.interactionStrength || 0) > 5 ? "fill-yellow-400" : ""
                  }`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={contacts.length < 10}
        >
          Next
        </Button>
      </div>
    </div>
  );
}