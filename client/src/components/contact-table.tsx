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
  totalPages: number;
  onPageChange: (page: number) => void;
  onFilterConnections: (connections: number[]) => void;
}

export default function ContactTable({
  contacts,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onFilterConnections
}: ContactTableProps) {
  const [_, setLocation] = useLocation();
  const [expandedConnections, setExpandedConnections] = useState<number[]>([]);
  
  // Component to fetch and display connection names
  const ConnectionNames = ({ connectionIds }: { connectionIds: number[] }) => {
    const [names, setNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      const fetchContactNames = async () => {
        setLoading(true);
        try {
          const namePromises = connectionIds.map(async (id) => {
            // First check if the contact is in our current list
            const contactInList = contacts.find(c => c.id === id);
            if (contactInList) {
              return contactInList.name;
            }
            
            // If not found, fetch it
            try {
              const response = await fetch(`/api/contacts/${id}`);
              const contact = await response.json();
              return contact.name;
            } catch (error) {
              console.error(`Failed to fetch contact #${id}`, error);
              return `Contact #${id}`;
            }
          });
          
          const resolvedNames = await Promise.all(namePromises);
          setNames(resolvedNames);
        } catch (error) {
          console.error("Error fetching contact names:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchContactNames();
    }, [connectionIds]);
    
    if (loading) {
      return <div className="py-1">Loading connections...</div>;
    }
    
    return (
      <>
        {names.map((name, i) => (
          <div key={i} className="py-1">{name}</div>
        ))}
      </>
    );
  };

  // Get names for a list of connection IDs
  const getConnectionNames = (connectionIds: number[]) => {
    // Use a Promise to fetch any contacts that aren't in the current contacts list
    return Promise.all(
      connectionIds.map(async (id) => {
        // First check if the contact is in our current list
        const contactInList = contacts.find(c => c.id === id);
        if (contactInList) {
          return contactInList.name;
        }
        
        // If not found in current list, fetch it from the API
        try {
          const response = await fetch(`/api/contacts/${id}`);
          const contact = await response.json();
          return contact.name;
        } catch (error) {
          console.error(`Failed to fetch contact #${id}`, error);
          return `Contact #${id}`;
        }
      })
    );
  };
</old_str>
<new_str>
  // Get names for a list of connection IDs
  const getConnectionNames = (connectionIds: number[]) => {
    // Look through all contacts, not just the currently displayed ones
    const allContacts = contacts.length > 0 ? contacts : [];
    return connectionIds
      .map(id => {
        const contact = allContacts.find(c => c.id === id);
        return contact ? contact.name : `Contact #${id}`;
      });
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts && contacts.length > 0 ? contacts.map((contact) => (
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
                        {contact.connections && contact.connections.length > 0 ? (
                          <ConnectionNames connectionIds={contact.connections} />
                        ) : (
                          <div className="py-1">No connections</div>
                        )}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </TableCell>
            </TableRow>
          )) : (
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
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <div className="flex justify-center gap-2 mt-4">
        <Button
          variant="outline"
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
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}