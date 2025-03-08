import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import ContactTable from "@/components/contact-table";
import SearchFilters from "@/components/search-filters";
import NetworkGraph from "@/components/network-graph";
import type { SearchParams } from "@shared/schema";

export default function Contacts() {
  const [_, setLocation] = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    limit: 10
  });

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['/api/contacts', searchParams],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchParams.query) params.append('query', searchParams.query);

      // Handle array parameters
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

      params.append('page', searchParams.page?.toString() || '1');
      params.append('limit', searchParams.limit?.toString() || '10');

      return fetch(`/api/contacts?${params}`).then(res => res.json());
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      if (overlayRef.current) {
        const scrolled = window.scrollY;
        const viewportHeight = window.innerHeight;
        // Only start moving the overlay when we're 75% down the page
        const threshold = viewportHeight * 0.75;
        const translateY = Math.max(0, viewportHeight - (scrolled - threshold));
        overlayRef.current.style.transform = `translateY(${translateY}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-[300vh] bg-background"> {/* Increased height to allow more scrolling */}
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
              onSearch={(params) => setSearchParams(prev => ({ ...prev, ...params, page: 1 }))}
            />
            <ContactTable
              contacts={contacts || []}
              isLoading={isLoading}
              onPageChange={(page) => setSearchParams(prev => ({ ...prev, page }))}
              currentPage={searchParams.page || 1}
            />
          </CardContent>
        </Card>

        {/* Add spacing to ensure content doesn't get hidden behind overlay */}
        <div className="h-screen" /> 
      </div>

      {/* Network Visualization Overlay */}
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
          {contacts && <NetworkGraph contacts={contacts} />}
        </div>
      </div>
    </div>
  );
}