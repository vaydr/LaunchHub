import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempItemsPerPage: number;
  theme: 'light' | 'dark';
  onTempItemsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onThemeToggle: () => void;
  onApplySettings: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  tempItemsPerPage,
  theme,
  onTempItemsPerPageChange,
  onThemeToggle,
  onApplySettings
}: SettingsModalProps) {
  if (!isOpen) return null;
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md dark:bg-gray-900 transition-colors duration-300">
        <DialogHeader>
          <DialogTitle className="dark:text-white transition-colors duration-300">Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="itemsPerPage" className="col-span-2 dark:text-white transition-colors duration-300">
              Items per page
            </Label>
            <Input
              id="itemsPerPage"
              type="number"
              value={tempItemsPerPage}
              onChange={onTempItemsPerPageChange}
              min="1"
              className="col-span-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors duration-300"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="darkMode" className="col-span-2 dark:text-white transition-colors duration-300">
              Dark Mode
            </Label>
            <div className="flex items-center space-x-2 col-span-2">
              <Switch
                id="darkMode"
                checked={theme === 'dark'}
                onCheckedChange={onThemeToggle}
                className={`transition-colors duration-300 ${theme === 'dark' ? 'bg-purple-600 data-[state=checked]:bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'}`}
              />
              {theme === 'dark' ? (
                <Moon className="h-4 w-4 dark:text-white transition-colors duration-300" />
              ) : (
                <Sun className="h-4 w-4 transition-colors duration-300" />
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="dark:border-gray-700 dark:text-gray-300 transition-colors duration-300"
          >
            Cancel
          </Button>
          <Button 
            onClick={onApplySettings}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-colors duration-300"
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 