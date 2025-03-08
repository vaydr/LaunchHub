import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import ContactTable from "@/components/contact-table";
import SearchFilters from "@/components/search-filters";
import type { SearchParams } from "@shared/schema";

const ITEMS_PER_PAGE = 10;

export default function Contacts() {
  const [_, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "",
    departments: [],
    years: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeConnectionFilters, setActiveConnectionFilters] = useState<number[]>([]);

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
    const filtered = activeConnectionFilters.length > 0
      ? contacts.filter(contact => {
          return activeConnectionFilters.some(filterId => {
            const activePerson = contacts.find(c => c.id === filterId);
            return activePerson?.connections.includes(contact.id);
          });
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
  }, [contacts, activeConnectionFilters, currentPage]);

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
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              Directory Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SearchFilters
              onSearch={setSearchParams}
              connectionPeople={activeConnectionFilters.map(id => ({
                id,
                name: contacts.find(c => c.id === id)?.name || ''
              }))}
              onClearConnectionFilters={() => {
                setActiveConnectionFilters([]);
                setCurrentPage(1); // Reset to page 1 when clearing connection filters
              }}
              onFilterConnections={id => {
                if (activeConnectionFilters.includes(id)) {
                  setActiveConnectionFilters(activeConnectionFilters.filter(filterId => filterId !== id));
                } else {
                  setActiveConnectionFilters([...activeConnectionFilters, id]);
                }
              }}
            />
            <ContactTable
              contacts={paginatedContacts}
              isLoading={isLoading}
              currentPage={adjustedCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onFilterConnections={id => {
                if (activeConnectionFilters.includes(id)) {
                  setActiveConnectionFilters(activeConnectionFilters.filter(filterId => filterId !== id));
                } else {
                  setActiveConnectionFilters([...activeConnectionFilters, id]);
                }
              }}
              activeConnectionFilter={activeConnectionFilters}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}