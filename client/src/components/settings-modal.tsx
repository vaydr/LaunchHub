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
  tempTheme: 'light' | 'dark';
  onTempItemsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTempThemeToggle: () => void;
  onApplySettings: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  tempItemsPerPage,
  tempTheme,
  onTempItemsPerPageChange,
  onTempThemeToggle,
  onApplySettings
}: SettingsModalProps) {
  if (!isOpen) return null;
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="itemsPerPage" className="col-span-2 dark:text-white">
              Items per page
            </Label>
            <Input
              id="itemsPerPage"
              type="number"
              value={tempItemsPerPage}
              onChange={onTempItemsPerPageChange}
              min="1"
              className="col-span-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="darkMode" className="col-span-2 dark:text-white">
              Dark Mode
            </Label>
            <div className="flex items-center space-x-2 col-span-2">
              <Switch
                id="darkMode"
                checked={tempTheme === 'dark'}
                onCheckedChange={onTempThemeToggle}
              />
              {tempTheme === 'dark' ? (
                <Moon className="h-4 w-4 dark:text-white" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="dark:border-gray-700 dark:text-gray-300"
          >
            Cancel
          </Button>
          <Button 
            onClick={onApplySettings}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 