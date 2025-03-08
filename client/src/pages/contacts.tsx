import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import ContactTable from "@/components/contact-table";
import SearchFilters from "@/components/search-filters";
import type { SearchParams } from "@shared/schema";

export default function Contacts() {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
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
      </div>
    </div>
  );
}
