import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Settings } from "lucide-react";

interface PageHeaderProps {
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export default function PageHeader({ onOpenProfile, onOpenSettings }: PageHeaderProps) {
  const [_, setLocation] = useLocation();

  return (
    <div className="flex justify-between items-center transition-colors duration-300">
      <Button 
        variant="outline"
        onClick={() => setLocation("/")}
        className="transition-colors duration-300"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenProfile}
          className="transition-colors duration-300"
        >
          <User className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenSettings}
          className="transition-colors duration-300"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 