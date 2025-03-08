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

  // Single source of truth for filtered contacts
  const { filteredContacts, paginatedContacts, totalPages } = useMemo(() => {
    // Apply connection filter if active
    const filtered = activeConnectionFilter 
      ? contacts.filter(contact => {
          const activePerson = contacts.find(c => c.id === activeConnectionFilter);
          return activePerson?.connections.includes(contact.id);
        })
      : contacts;

    // Calculate pagination
    const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(start, Math.min(start + ITEMS_PER_PAGE, filtered.length));

    return {
      filteredContacts: filtered,
      paginatedContacts: paginated,
      totalPages: total
    };
  }, [contacts, activeConnectionFilter, currentPage]);

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
              connectionPerson={activeConnectionFilter ? { 
                id: activeConnectionFilter, 
                name: contacts.find(c => c.id === activeConnectionFilter)?.name || '' 
              } : null}
              onClearConnectionFilter={() => setActiveConnectionFilter(null)}
            />
            <ContactTable
              contacts={paginatedContacts}
              isLoading={isLoading}
              currentPage={currentPage}
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