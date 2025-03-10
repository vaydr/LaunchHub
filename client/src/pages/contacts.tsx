import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Settings, Moon, Sun } from "lucide-react";
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
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Initialize from localStorage if available
    return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
  });

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
    queryKey: ['/api/contacts', searchParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchParams.query) params.append('query', searchParams.query);
      if (searchParams.departments) {
        searchParams.departments.forEach(dept => params.append('departments', dept));
      }
      if (searchParams.years) {
        searchParams.years.forEach(year => params.append('years', year.toString()));
      }
      return fetch(`/api/contacts?${params}`).then(res => res.json());
    }
  });

  // Single source of truth for filtered contacts and pagination
  const { paginatedContacts, totalPages, adjustedCurrentPage } = useMemo(() => {
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
      adjustedCurrentPage: adjustedPage
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

  const SettingsModal = () => {
    // Create temporary state for settings that are only applied on "Apply" button click
    const [tempItemsPerPage, setTempItemsPerPage] = useState(itemsPerPage);
    const [tempTheme, setTempTheme] = useState(theme);
    
    // Reset temporary settings when modal opens
    useEffect(() => {
      if (isSettingsOpen) {
        setTempItemsPerPage(itemsPerPage);
        setTempTheme(theme);
      }
    }, [isSettingsOpen, itemsPerPage, theme]);
    
    const handleTempItemsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      if (value > 0) {
        setTempItemsPerPage(value);
      }
    };
    
    const handleTempThemeToggle = () => {
      setTempTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };
    
    const applySettings = () => {
      // Apply items per page
      setItemsPerPage(tempItemsPerPage);
      localStorage.setItem('itemsPerPage', tempItemsPerPage.toString());
      
      // Apply theme
      setTheme(tempTheme);
      
      // Close modal
      setIsSettingsOpen(false);
    };
    
    return (
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
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
                  className="data-[state=checked]:bg-purple-600"
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
              onClick={() => setIsSettingsOpen(false)}
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
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-6 w-6 text-purple-600" />
                <span>Directory Search</span>
              </div>
              <Button 
                className="text-white"
                onClick={() => setLocation("/network")}
                style={{
                  background: 'linear-gradient(to right, #6600ff, #1a00ff, #9d00ff)',
                  backgroundSize: '200% 100%',
                  animation: 'gradient 20s linear infinite',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animation = 'gradient 5s linear infinite';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animation = 'gradient 20s linear infinite';
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                </svg>
                View Personal Network
              </Button>
            </CardTitle>

          </CardHeader>
          <CardContent>
            <SearchFilters
              onSearch={setSearchParams}
              connectionPerson={activeConnectionFilter ? { 
                id: activeConnectionFilter, 
                name: contacts.find((c: Contact) => c.id === activeConnectionFilter)?.name || '' 
              } : null}
              onClearConnectionFilter={() => setActiveConnectionFilter(null)}
            />
            <ContactTable
              contacts={paginatedContacts}
              isLoading={isLoading}
              currentPage={adjustedCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onFilterConnections={setActiveConnectionFilter}
              activeConnectionFilter={activeConnectionFilter}
            />
          </CardContent>
        </Card>
      </div>
      <SettingsModal />
    </div>
  );
}