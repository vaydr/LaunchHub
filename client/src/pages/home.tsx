import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ContactTable from "@/components/contact-table";
import SearchFilters from "@/components/search-filters";
import { Users, Search, Star, Link } from "lucide-react";
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
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-background py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent animate-fade-in">
              MIT Directory
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Your smart contact management system for the MIT community. Keep track of your connections, interactions, and build meaningful relationships.
            </p>
          </div>

          {/* Features Grid */}
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                title: "Smart Directory",
                description: "Access the MIT community directory with comprehensive filtering and search capabilities."
              },
              {
                icon: <Star className="h-8 w-8" />,
                title: "Interaction Tracking",
                description: "Keep track of your interactions and build stronger connections over time."
              },
              {
                icon: <Link className="h-8 w-8" />,
                title: "Multiple Contact Methods",
                description: "Connect via email, Slack, or schedule office visits - all in one place."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-lg bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Section */}
      <div className="container mx-auto py-8 px-4">
        <Card className="mt-8">
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