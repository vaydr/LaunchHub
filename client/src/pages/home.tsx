import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ContactTable from "@/components/contact-table";
import SearchFilters from "@/components/search-filters";
import type { SearchParams } from "@shared/schema";

export default function Home() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    limit: 10
  });

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['/api/contacts', searchParams],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchParams.query) params.append('query', searchParams.query);
      if (searchParams.department) params.append('department', searchParams.department);
      if (searchParams.year) params.append('year', searchParams.year.toString());
      params.append('page', searchParams.page?.toString() || '1');
      params.append('limit', searchParams.limit?.toString() || '10');
      
      return fetch(`/api/contacts?${params}`).then(res => res.json());
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              MIT Directory
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
