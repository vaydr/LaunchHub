import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Moon, Sun } from "lucide-react";
import { useNetwork } from "@/contexts/network-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NetworkSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function NetworkSettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeToggle
}: NetworkSettingsModalProps) {
  const { settings, updateSettings } = useNetwork();
  
  if (!isOpen) return null;
  
  const handleMaxNodeCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      updateSettings({ maxNodeCount: value });
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md dark:bg-gray-900 transition-colors duration-300 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="dark:text-white transition-colors duration-300">Network Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Theme Toggle */}
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
          
          <Separator className="my-2" />
          <h3 className="text-sm font-medium dark:text-white">Performance Settings</h3>
          
          {/* Max Node Count */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxNodeCount" className="col-span-2 dark:text-white transition-colors duration-300">
              Max Nodes
            </Label>
            <div className="col-span-2">
              <Input
                id="maxNodeCount"
                type="number"
                min="10"
                max="500"
                value={settings.maxNodeCount}
                onChange={handleMaxNodeCountChange}
                className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Limit nodes for better performance (10-500)
              </p>
            </div>
          </div>
          
          <Separator className="my-2" />
          <h3 className="text-sm font-medium dark:text-white">Node & Edge Appearance</h3>
          
          {/* Node Size Slider */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nodeSize" className="col-span-2 dark:text-white transition-colors duration-300">
              Node Size <span className="text-purple-600 dark:text-purple-400 ml-1">{settings.nodeSize}</span>
            </Label>
            <div className="col-span-2">
              <Slider
                id="nodeSize"
                min={1}
                max={10}
                step={1}
                value={[settings.nodeSize]}
                onValueChange={(value) => updateSettings({ nodeSize: value[0] })}
                className={cn("w-full [&>[role=slider]]:bg-purple-600 [&>[role=slider]]:border-purple-600 [&>[role=slider]]:focus:ring-purple-600 [&>[role=slider]]:focus:ring-offset-purple-600 [&>[role=slider]]:hover:bg-purple-700 [&>[role=slider]]:hover:border-purple-700 [&>.slider-track]:bg-purple-600 [&>.slider-range]:bg-purple-600")}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Small</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Large</span>
              </div>
            </div>
          </div>
          
          {/* Edge Thickness Slider */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edgeThickness" className="col-span-2 dark:text-white transition-colors duration-300">
              Edge Thickness <span className="text-purple-600 dark:text-purple-400 ml-1">{settings.edgeThickness}</span>
            </Label>
            <div className="col-span-2">
              <Slider
                id="edgeThickness"
                min={0.5}
                max={3}
                step={0.5}
                value={[settings.edgeThickness]}
                onValueChange={(value) => updateSettings({ edgeThickness: value[0] })}
                className={cn("w-full [&>[role=slider]]:bg-purple-600 [&>[role=slider]]:border-purple-600 [&>[role=slider]]:focus:ring-purple-600 [&>[role=slider]]:focus:ring-offset-purple-600 [&>[role=slider]]:hover:bg-purple-700 [&>[role=slider]]:hover:border-purple-700 [&>.slider-track]:bg-purple-600 [&>.slider-range]:bg-purple-600")}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Thin</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Thick</span>
              </div>
            </div>
          </div>
          
          {/* Show Labels Toggle */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="showLabels" className="col-span-2 dark:text-white transition-colors duration-300">
              Show Labels
            </Label>
            <div className="flex items-center space-x-2 col-span-2">
              <Switch
                id="showLabels"
                checked={settings.showLabels}
                onCheckedChange={(checked) => updateSettings({ showLabels: checked })}
                className={`transition-colors duration-300 ${settings.showLabels ? 'bg-purple-600 data-[state=checked]:bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'}`}
              />
            </div>
          </div>
          
          {/* Color Scheme Select */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="colorScheme" className="col-span-2 dark:text-white transition-colors duration-300">
              Color Scheme
            </Label>
            <div className="col-span-2">
              <Select
                value={settings.colorScheme}
                onValueChange={(value) => updateSettings({ colorScheme: value as 'default' | 'rainbow' | 'heat' })}
              >
                <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <SelectValue placeholder="Select color scheme" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="rainbow">Rainbow</SelectItem>
                  <SelectItem value="heat">Heat Map</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator className="my-2" />
          <h3 className="text-sm font-medium dark:text-white">Force Graph Physics</h3>
          
          {/* Charge Strength Slider */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chargeStrength" className="col-span-2 dark:text-white transition-colors duration-300">
              Repulsion Force <span className="text-purple-600 dark:text-purple-400 ml-1">{Math.abs(settings.chargeStrength)}</span>
            </Label>
            <div className="col-span-2">
              <Slider
                id="chargeStrength"
                min={-100}
                max={-10}
                step={5}
                value={[settings.chargeStrength]}
                onValueChange={(value) => updateSettings({ chargeStrength: value[0] })}
                className={cn("w-full [&>[role=slider]]:bg-purple-600 [&>[role=slider]]:border-purple-600 [&>[role=slider]]:focus:ring-purple-600 [&>[role=slider]]:focus:ring-offset-purple-600 [&>[role=slider]]:hover:bg-purple-700 [&>[role=slider]]:hover:border-purple-700 [&>.slider-track]:bg-purple-600 [&>.slider-range]:bg-purple-600")}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Weak</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Strong</span>
              </div>
            </div>
          </div>
          
          {/* Link Distance Slider */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="linkDistance" className="col-span-2 dark:text-white transition-colors duration-300">
              Link Distance <span className="text-purple-600 dark:text-purple-400 ml-1">{settings.linkDistance}</span>
            </Label>
            <div className="col-span-2">
              <Slider
                id="linkDistance"
                min={10}
                max={100}
                step={5}
                value={[settings.linkDistance]}
                onValueChange={(value) => updateSettings({ linkDistance: value[0] })}
                className={cn("w-full [&>[role=slider]]:bg-purple-600 [&>[role=slider]]:border-purple-600 [&>[role=slider]]:focus:ring-purple-600 [&>[role=slider]]:focus:ring-offset-purple-600 [&>[role=slider]]:hover:bg-purple-700 [&>[role=slider]]:hover:border-purple-700 [&>.slider-track]:bg-purple-600 [&>.slider-range]:bg-purple-600")}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Close</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Far</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="dark:border-gray-700 dark:text-gray-300 transition-colors duration-300"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 