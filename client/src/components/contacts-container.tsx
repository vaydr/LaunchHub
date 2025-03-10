import React, { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ContactsContainerProps {
  children: ReactNode;
}

export default function ContactsContainer({ children }: ContactsContainerProps) {
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        {children}
      </div>
    </div>
  );
}

export function ContactsCard({ children }: ContactsContainerProps) {
  return (
    <Card className="transition-colors duration-300">
      <CardContent className="pt-6 relative transition-colors duration-300">
        {children}
      </CardContent>
    </Card>
  );
} 