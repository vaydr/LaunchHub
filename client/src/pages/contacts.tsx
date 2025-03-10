import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Settings, Moon, Sun, User, LogOut, Network } from "lucide-react";
import ContactTable from "@/components/contact-table";
import SearchFilters from "@/components/search-filters";
import type { SearchParams } from "@shared/schema";
import type { Contact } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const ITEMS_PER_PAGE = 10;

export default function Contacts() {
  const [_, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "",
    departments: [],
    years: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeConnectionFilter, setActiveConnectionFilter] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Initialize from localStorage if available
    return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
  });
  const [socialCreditScore] = useState(() => Math.floor(Math.random() * 1001)); // Random score between 0-1000
  
  // Move these states outside the useMemo for settings modal
  const [tempItemsPerPage, setTempItemsPerPage] = useState(itemsPerPage);
  const [tempTheme, setTempTheme] = useState(theme);
  
  // Add refs to prevent multiple state updates
  const isUpdatingSettings = useRef(false);
  const isUpdatingProfile = useRef(false);

  // Add state and handler for tracking advanced search mode
  const [isAdvancedSearchMode, setIsAdvancedSearchMode] = useState(false);

  // Update temp values when settings modal opens or underlying values change
  useEffect(() => {
    if (isSettingsOpen) {
      setTempItemsPerPage(itemsPerPage);
      setTempTheme(theme);
    }
  }, [isSettingsOpen, itemsPerPage, theme]);

  // Apply theme effect without causing re-renders
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Initialize itemsPerPage from localStorage on mount
  useEffect(() => {
    const savedItemsPerPage = localStorage.getItem('itemsPerPage');
    if (savedItemsPerPage) {
      setItemsPerPage(parseInt(savedItemsPerPage));
    }
  }, []);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['/api/contacts', searchParams, activeConnectionFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchParams.query) params.append('query', searchParams.query);
      if (searchParams.departments && searchParams.departments.length > 0) {
        searchParams.departments.forEach(dept => params.append('departments', dept));
      }
      if (searchParams.years && searchParams.years.length > 0) {
        searchParams.years.forEach(year => params.append('years', year.toString()));
      }
      
      // Add support for tags in the API call
      if ((searchParams as any).tags && (searchParams as any).tags.length > 0) {
        (searchParams as any).tags.forEach((tag: string) => params.append('tags', tag));
      }
      
      // Add connection filter to API call if active
      if (activeConnectionFilter) {
        params.append('connection', activeConnectionFilter.toString());
      }
      
      // Add semantic search flag if present
      if ((searchParams as any).semantic) {
        params.append('semantic', 'true');
      }
      
      return fetch(`/api/contacts?${params}`).then(res => res.json());
    }
  });

  // Single source of truth for filtered contacts and pagination
  const { paginatedContacts, totalPages, adjustedCurrentPage, totalEntries } = useMemo(() => {
    // Apply connection filter if active
    const filtered = activeConnectionFilter 
      ? contacts.filter((contact: Contact) => {
          const activePerson = contacts.find((c: Contact) => c.id === activeConnectionFilter);
          return activePerson?.connections.includes(contact.id);
        })
      : contacts;

    // Calculate total pages
    const total = Math.ceil(filtered.length / itemsPerPage);

    // Ensure current page is valid for the filtered set
    const adjustedPage = Math.min(currentPage, total || 1);

    // Calculate slice indices based on adjusted page
    const start = (adjustedPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);

    return {
      paginatedContacts: paginated,
      totalPages: total,
      adjustedCurrentPage: adjustedPage,
      totalEntries: filtered.length
    };
  }, [contacts, activeConnectionFilter, currentPage, itemsPerPage]);

  // If the adjusted page is different from current page, update it
  useEffect(() => {
    if (adjustedCurrentPage !== currentPage) {
      setCurrentPage(adjustedCurrentPage);
    }
  }, [adjustedCurrentPage, currentPage]);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setItemsPerPage(value);
      localStorage.setItem('itemsPerPage', value.toString());
    }
  };

  const toggleDarkMode = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // Helper function to get rating category for social credit score
  const getSocialCreditCategory = (score: number) => {
    const maxScore = 1000;
    const normalizedValue = score / maxScore;
    
    if (normalizedValue < 0.1) return -3; // Triple negative
    if (normalizedValue < 0.25) return -2; // Double negative
    if (normalizedValue < 0.4) return -1; // Single negative
    if (normalizedValue < 0.6) return 0;  // Neutral
    if (normalizedValue < 0.75) return 1;  // Single positive
    if (normalizedValue < 0.9) return 2;  // Double positive
    return 3; // Triple positive
  };
  
  // Helper function to get RGB color for social credit score
  const getSocialCreditColorRGB = (score: number): string => {
    const category = getSocialCreditCategory(score);
    switch (category) {
      case 3: return "75, 180, 80"; // Green for triple positive
      case 2: return "95, 200, 100"; // Light green for double positive
      case 1: return "150, 210, 120"; // Pale green for single positive
      case 0: return "150, 150, 150"; // Gray for neutral
      case -1: return "240, 150, 120"; // Pale red for single negative
      case -2: return "240, 120, 90"; // Light red for double negative
      case -3: return "240, 80, 70"; // Red for triple negative
      default: return "150, 150, 150"; // Default gray
    }
  };
  
  // Get description for social credit score
  const getSocialCreditDescription = (score: number): string => {
    const category = getSocialCreditCategory(score);
    switch (category) {
      case 3: return "Exemplary citizen! You're a pillar of our community.";
      case 2: return "Outstanding social standing! Keep up the good work.";
      case 1: return "Good standing in the community. Room for improvement.";
      case 0: return "Average community member. Neither outstanding nor concerning.";
      case -1: return "Some concerning patterns. Please review community guidelines.";
      case -2: return "Significant issues detected. Improvement strongly advised.";
      case -3: return "Critical standing. Immediate corrective action required.";
      default: return "Score under evaluation.";
    }
  };

  // Handlers for the temp values (moved outside of the useMemo)
  const handleTempItemsPerPageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setTempItemsPerPage(value);
    }
  }, []);
  
  const handleTempThemeToggle = useCallback(() => {
    setTempTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  }, []);
  
  const applySettings = useCallback(() => {
    // Apply items per page
    setItemsPerPage(tempItemsPerPage);
    localStorage.setItem('itemsPerPage', tempItemsPerPage.toString());
    
    // Apply theme
    setTheme(tempTheme);
    
    // Close modal
    setIsSettingsOpen(false);
  }, [tempItemsPerPage, tempTheme]);

  // Stable handler for settings modal
  const handleSettingsToggle = (open: boolean) => {
    if (isUpdatingSettings.current) return;
    isUpdatingSettings.current = true;
    
    // Use setTimeout to add a small delay and prevent multiple state updates
    setTimeout(() => {
      setIsSettingsOpen(open);
      isUpdatingSettings.current = false;
    }, 100);
  };
  
  // Stable handler for profile modal
  const handleProfileToggle = (open: boolean) => {
    if (isUpdatingProfile.current) return;
    isUpdatingProfile.current = true;
    
    // Use setTimeout to add a small delay and prevent multiple state updates
    setTimeout(() => {
      setIsProfileOpen(open);
      isUpdatingProfile.current = false;
    }, 100);
  };

  // Stable setters using useCallback
  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);
  
  const openProfile = useCallback(() => setIsProfileOpen(true), []);
  const closeProfile = useCallback(() => setIsProfileOpen(false), []);

  // Memoize the modal components to prevent unnecessary re-renders
  const MemoizedProfileModal = useMemo(() => {
    if (!isProfileOpen) return null;
    
    return (
      <Dialog open={true} onOpenChange={(open) => !open && closeProfile()}>
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
            <Button onClick={closeProfile}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }, [isProfileOpen, closeProfile, socialCreditScore, setLocation]);
  
  const MemoizedSettingsModal = useMemo(() => {
    if (!isSettingsOpen) return null;
    
    return (
      <Dialog open={true} onOpenChange={(open) => !open && closeSettings()}>
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
                onChange={handleTempItemsPerPageChange}
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
                  onCheckedChange={handleTempThemeToggle}
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
              onClick={closeSettings}
              className="dark:border-gray-700 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={applySettings}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }, [isSettingsOpen, closeSettings, tempItemsPerPage, tempTheme, handleTempItemsPerPageChange, handleTempThemeToggle, applySettings]);

  // Handle search params changes including advanced search mode
  const handleSearchParamsChange = (params: Partial<any>) => {
    // Check if the search mode has changed
    if (params.semantic !== undefined && params.semantic !== isAdvancedSearchMode) {
      setIsAdvancedSearchMode(params.semantic);
    }
    
    setSearchParams(prevParams => ({ ...prevParams, ...params }));
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={openProfile}
            >
              <User className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={openSettings}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 relative">
            {/* Centered Bloke title as absolute positioned element */}
            <div className="absolute top-6 left-0 right-0 flex justify-center z-10 pointer-events-none">
              <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 opacity-90">
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
            
            <SearchFilters 
              onSearch={handleSearchParamsChange}
              connectionPerson={activeConnectionFilter ? contacts.find((c: Contact) => c.id === activeConnectionFilter) ?? null : null}
              onClearConnectionFilter={() => setActiveConnectionFilter(null)}
            />
            
            <ContactTable
              contacts={paginatedContacts}
              isLoading={isLoading}
              currentPage={adjustedCurrentPage}
              totalPages={totalPages}
              totalEntries={totalEntries}
              onPageChange={setCurrentPage}
              onFilterConnections={setActiveConnectionFilter}
              activeConnectionFilter={activeConnectionFilter}
            />
          </CardContent>
        </Card>

        {/* Render modals */}
        {MemoizedProfileModal}
        {MemoizedSettingsModal}
      </div>
    </div>
  );
}