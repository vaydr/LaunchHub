import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import ContactTable from "@/components/contact-table";
import SearchFilters from "@/components/search-filters";
import type { SearchParams } from "@shared/schema";
import type { Contact } from "@shared/schema";
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
    const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);

    // Ensure current page is valid for the filtered set
    const adjustedPage = Math.min(currentPage, total || 1);

    // Calculate slice indices based on adjusted page
    const start = (adjustedPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

    return {
      paginatedContacts: paginated,
      totalPages: total,
      adjustedCurrentPage: adjustedPage
    };
  }, [contacts, activeConnectionFilter, currentPage]);

  // If the adjusted page is different from current page, update it
  if (adjustedCurrentPage !== currentPage) {
    setCurrentPage(adjustedCurrentPage);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

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
    </div>
  );
}