import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Network } from "lucide-react";

export default function ContactsHeader() {
  const [_, setLocation] = useLocation();

  return (
    <>
      {/* Centered Bloke title as absolute positioned element */}
      <div className="absolute top-6 left-0 right-0 flex justify-center z-10 pointer-events-none">
        <h1 className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 opacity-90">
          Bloke
        </h1>
      </div>
      
      {/* View in Network button */}
      <div className="absolute top-4 right-4 z-10">
        <Button 
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium"
          onClick={() => setLocation("/network")}
        >
          <Network className="mr-2 h-4 w-4" />
          View in Network
        </Button>
      </div>
    </>
  );
} 