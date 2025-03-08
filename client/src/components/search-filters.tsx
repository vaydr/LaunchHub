import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SearchParams } from "@shared/schema";

const DEPARTMENTS = [
  "EECS",
  "Biology",
  "Physics",
  "Mathematics",
  "Chemistry",
  "Mechanical Engineering",
];

interface SearchFiltersProps {
  onSearch: (params: Partial<SearchParams>) => void;
}

export default function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState<string | undefined>();
  const [year, setYear] = useState<string | undefined>();

  const handleSearch = () => {
    onSearch({
      query,
      department,
      year: year ? parseInt(year) : undefined,
    });
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
          value={department}
          onValueChange={setDepartment}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Department" />
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
          value={year}
          onValueChange={setYear}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026, 2027].map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleSearch}>
          Search
        </Button>
      </div>
    </div>
  );
}