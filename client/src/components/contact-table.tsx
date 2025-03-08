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
import { Star } from "lucide-react";
import type { Contact } from "@shared/schema";

interface ContactTableProps {
  contacts: Contact[];
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function ContactTable({
  contacts,
  isLoading,
  currentPage,
  onPageChange
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
            <TableHead>Interaction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow
              key={contact.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => setLocation(`/contact/${contact.id}`)}
            >
              <TableCell className="font-medium">{contact.name}</TableCell>
              <TableCell>{contact.kerberos}</TableCell>
              <TableCell>{contact.department}</TableCell>
              <TableCell>{contact.year}</TableCell>
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