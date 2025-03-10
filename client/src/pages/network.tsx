import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import NetworkSettingsModal from "@/components/network-settings-modal";
import NetworkCanvas from "@/components/network-canvas";
import { useTheme } from "@/contexts/theme-context";
import { NetworkProvider } from "@/contexts/network-context";

export default function NetworkPage() {
  const [_, setLocation] = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  return (
    <NetworkProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <Button 
            variant="outline"
            onClick={() => setLocation("/contacts")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contacts
          </Button>
          <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
            Network View
          </h1>
          <div>
            <Button
              variant="outline"
              size="icon"
              onClick={openSettings}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Canvas area for the graph */}
        <div className="w-full h-[calc(100vh-80px)] p-4">
          <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md transition-colors duration-300">
            <NetworkCanvas theme={theme} />
          </div>
        </div>

        {/* Settings Modal */}
        <NetworkSettingsModal
          isOpen={isSettingsOpen}
          onClose={closeSettings}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      </div>
    </NetworkProvider>
  );
} 