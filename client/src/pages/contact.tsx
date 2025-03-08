import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: contact, isLoading } = useQuery({
    queryKey: [`/api/contacts/${id}`],
    queryFn: () => fetch(`/api/contacts/${id}`).then(res => res.json())
  });

  const mutation = useMutation({
    mutationFn: (updates: any) => 
      fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contacts/${id}`] });
      toast({
        title: "Success",
        description: "Contact updated successfully"
      });
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!contact) {
    return <div>Contact not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Directory
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              <span>{contact.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => 
                  mutation.mutate({
                    interactionStrength: (contact.interactionStrength || 0) + 1,
                    lastInteraction: new Date()
                  })
                }
              >
                <Star
                  className={`h-5 w-5 ${
                    contact.interactionStrength > 5 ? "fill-yellow-400" : ""
                  }`}
                />
                <span className="ml-2">{contact.interactionStrength}</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Basic Info</h3>
              <p>Kerberos: {contact.kerberos}</p>
              <p>Email: {contact.email}</p>
              <p>Department: {contact.department}</p>
              <p>Year: {contact.year}</p>
              <p>Role: {contact.role}</p>
            </div>

            <div>
              <h3 className="font-semibold">Contact Methods</h3>
              {contact.contactMethods.phone && <p>Phone: {contact.contactMethods.phone}</p>}
              {contact.contactMethods.slack && <p>Slack: {contact.contactMethods.slack}</p>}
              {contact.contactMethods.office && <p>Office: {contact.contactMethods.office}</p>}
            </div>

            {contact.notes && (
              <div>
                <h3 className="font-semibold">Notes</h3>
                <p>{contact.notes}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold">Last Interaction</h3>
              <p>{new Date(contact.lastInteraction).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
