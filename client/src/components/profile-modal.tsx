import React from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  socialCreditScore: number;
  getSocialCreditColorRGB: (score: number) => string;
  getSocialCreditDescription: (score: number) => string;
}

export default function ProfileModal({
  isOpen,
  onClose,
  socialCreditScore,
  getSocialCreditColorRGB,
  getSocialCreditDescription
}: ProfileModalProps) {
  const [_, setLocation] = useLocation();

  if (!isOpen) return null;
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">My Profile</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full overflow-hidden mb-2">
                <img 
                  src="https://avatars.githubusercontent.com/u/85?v=4" 
                  alt="Your Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="text-lg font-medium">John Doe</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">MIT Research Lab</p>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={() => setLocation("/")}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Social Credit Score</h4>
              <div className="text-2xl font-bold mb-2 flex justify-between items-center">
                <span style={{ color: `rgb(${getSocialCreditColorRGB(socialCreditScore)})` }}>
                  {socialCreditScore}
                </span>
                <span className="text-xs">/1000</span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                <div 
                  className="h-2.5 rounded-full" 
                  style={{ 
                    width: `${(socialCreditScore / 1000) * 100}%`,
                    backgroundColor: `rgb(${getSocialCreditColorRGB(socialCreditScore)})`
                  }}
                ></div>
              </div>
              
              <p className="text-xs mt-2" style={{ color: `rgb(${getSocialCreditColorRGB(socialCreditScore)})` }}>
                {getSocialCreditDescription(socialCreditScore)}
              </p>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Account Status</h4>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400"></div>
                <span className="text-sm font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 