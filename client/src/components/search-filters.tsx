import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import type { SearchParams } from "@shared/schema";

const DEPARTMENTS = [
  "EECS",
  "Biology",
  "Physics",
  "Mathematics",
  "Chemistry",
  "Economics",
  "MechE",
];

interface FilterTag {
  type: 'department' | 'year' | 'connection';
  value: string;
  label?: string;
}

interface SearchFiltersProps {
  onSearch: (params: Partial<SearchParams>) => void;
  connectionPerson: { id: number; name: string } | null;
  onClearConnectionFilter: () => void;
}

export default function SearchFilters({ 
  onSearch, 
  connectionPerson,
  onClearConnectionFilter
}: SearchFiltersProps) {
  const [query, setQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<FilterTag[]>([]);

  // When filters change, trigger search
  useEffect(() => {
    const departments = selectedFilters
      .filter(f => f.type === 'department')
      .map(f => f.value);

    const years = selectedFilters
      .filter(f => f.type === 'year')
      .map(f => parseInt(f.value))
      .filter(year => !isNaN(year));

    onSearch({
      query,
      departments,
      years
    });
  }, [query, selectedFilters, onSearch]);

  // Update filters when connection person changes
  useEffect(() => {
    if (connectionPerson) {
      setSelectedFilters(prev => {
        const withoutConnections = prev.filter(f => f.type !== 'connection');
        return [...withoutConnections, {
          type: 'connection',
          value: connectionPerson.id.toString(),
          label: `Connected to: ${connectionPerson.name}`
        }];
      });
    } else {
      setSelectedFilters(prev => prev.filter(f => f.type !== 'connection'));
    }
  }, [connectionPerson]);

  const handleAddFilter = (type: 'department' | 'year', value: string) => {
    if (!selectedFilters.some(f => f.type === type && f.value === value)) {
      setSelectedFilters(prev => [...prev, { type, value }]);
    }
  };

  const handleRemoveFilter = (filter: FilterTag) => {
    if (filter.type === 'connection') {
      onClearConnectionFilter();
    } else {
      setSelectedFilters(prev => 
        prev.filter(f => !(f.type === filter.type && f.value === filter.value))
      );
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex gap-4">
        <Input
          placeholder="Search by name, kerberos, or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />

        <Select
          value=""
          onValueChange={(value) => handleAddFilter('department', value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Add Department" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value=""
          onValueChange={(value) => handleAddFilter('year', value)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Add Year" />
          </SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026, 2027].map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filter Tags */}
      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFilters.map((filter, index) => (
            <div
              key={`${filter.type}-${filter.value}-${index}`}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-sm"
            >
              <span>{filter.label || `${filter.type}: ${filter.value}`}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-full hover:bg-primary/20"
                onClick={() => handleRemoveFilter(filter)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}