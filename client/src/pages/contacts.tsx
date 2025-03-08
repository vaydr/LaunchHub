import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import ContactTable from "@/components/contact-table";
import SearchFilters from "@/components/search-filters";
import NetworkGraph from "@/components/network-graph";
import type { SearchParams, Contact } from "@shared/schema";

export default function Contacts() {
  const [_, setLocation] = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "",
    departments: [],
    years: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeConnectionFilter, setActiveConnectionFilter] = useState<number | null>(null);
  const ITEMS_PER_PAGE = 10;

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['/api/contacts', searchParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchParams.query) params.append('query', searchParams.query);

      if (searchParams.departments) {
        searchParams.departments.forEach(dept => 
          params.append('departments', dept)
        );
      }

      if (searchParams.years) {
        searchParams.years.forEach(year => 
          params.append('years', year.toString())
        );
      }

      return fetch(`/api/contacts?${params}`).then(res => res.json());
    }
  });

  // Filter contacts if showing connections for a specific person
  let displayContacts = contacts;
  const activePerson = activeConnectionFilter ? contacts.find(c => c.id === activeConnectionFilter) : null;

  if (activePerson) {
    // Filter to only show contacts that this person is connected to
    displayContacts = contacts.filter(contact => 
      activePerson.connections.includes(contact.id)
    );
  }

  // Paginate the contacts for the table
  const paginatedContacts = displayContacts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(displayContacts.length / ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchParams, activeConnectionFilter]);

  useEffect(() => {
    const handleScroll = () => {
      if (overlayRef.current) {
        const scrolled = window.scrollY;
        const viewportHeight = window.innerHeight;
        const threshold = viewportHeight * 0.75;
        const translateY = Math.max(0, viewportHeight - (scrolled - threshold));
        overlayRef.current.style.transform = `translateY(${translateY}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-[300vh] bg-background">
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
              connectionPerson={activePerson ? { id: activePerson.id, name: activePerson.name } : null}
              onClearConnectionFilter={() => setActiveConnectionFilter(null)}
            />
            <ContactTable
              contacts={paginatedContacts}
              isLoading={isLoading}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
              onFilterConnections={setActiveConnectionFilter}
              activeConnectionFilter={activeConnectionFilter}
            />
          </CardContent>
        </Card>

        <div className="h-screen" />
      </div>

      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black/95"
        style={{ 
          transform: 'translateY(100vh)',
          transition: 'transform 0.3s ease-out'
        }}
      >
        <div className="container mx-auto px-4 py-24">
          <h2 className="text-4xl font-bold mb-8 text-white">Network Visualization</h2>
          <NetworkGraph contacts={displayContacts} />
        </div>
      </div>
    </div>
  );
}