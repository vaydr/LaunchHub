import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SearchParams } from "@shared/schema";
import type { Contact } from "@shared/schema";
import { FilterTag, getTagColor, relationshipTags } from "./TagComponent"; // Add relationshipTags import

// Extended search params to include tags and semantic search
interface ExtendedSearchParams extends SearchParams {
  tags?: string[];
  connection?: number | null;
  semantic?: boolean;
}

// Define available filter categories
const DEPARTMENTS = [
  "EECS",
  "Biology",
  "Physics",
  "Mathematics",
  "Chemistry",
  "Economics",
  "MechE",
];

const YEARS = [2024, 2025, 2026, 2027];

// Use shared tag definitions
const TAGS = relationshipTags.map(tag => tag.name);

// Update FilterTag interface to match the shared component
interface SearchFilterTag {
  type: 'department' | 'year' | 'tag' | 'connection';
  value: string;
  label?: string;
}

interface SearchFiltersProps {
  onSearch: (params: Partial<ExtendedSearchParams>) => void;
  connectionPerson: Contact | null;
  onClearConnectionFilter: () => void;
}

export default function SearchFilters({ 
  onSearch, 
  connectionPerson,
  onClearConnectionFilter
}: SearchFiltersProps) {
  // State
  const [query, setQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<SearchFilterTag[]>([]);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [advancedQuery, setAdvancedQuery] = useState("");
  
  // Reference for input animation
  const simpleSearchRef = useRef<HTMLDivElement>(null);
  const advancedSearchRef = useRef<HTMLDivElement>(null);
  
  // Track active connection filter
  const activeConnectionFilter = connectionPerson ? connectionPerson.id : null;

  // Add a state to track if animation is in progress to prevent spamming
  const [isAnimating, setIsAnimating] = useState(false);

  // When filters change, trigger search with OR/AND logic
  useEffect(() => {
    // Group filters by type (OR within categories)
    const departments = selectedFilters
      .filter(f => f.type === 'department')
      .map(f => f.value);

    const years = selectedFilters
      .filter(f => f.type === 'year')
      .map(f => parseInt(f.value))
      .filter(year => !isNaN(year));
      
    const tags = selectedFilters
      .filter(f => f.type === 'tag')
      .map(f => f.value);
    
    // Simple search mode uses filters
    if (!isAdvancedSearch) {
      onSearch({
        query,
        departments,
        years,
        tags, // Add tags to search params
        connection: activeConnectionFilter
      } as ExtendedSearchParams);
    } 
    // Advanced search would use semantic search
    else {
      onSearch({
        query: advancedQuery,
        // For now, we'll keep filters active in advanced mode too
        departments,
        years,
        tags,
        connection: activeConnectionFilter,
        semantic: true // Flag for backend to handle semantic search
      } as ExtendedSearchParams);
    }
  }, [query, advancedQuery, selectedFilters, isAdvancedSearch, onSearch, activeConnectionFilter]);

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

  // Add a filter with OR logic within category - simplified to use shared function
  const handleAddFilter = (type: 'department' | 'year' | 'tag', value: string) => {
    // Only add if not already present
    if (!selectedFilters.some(f => f.type === type && f.value === value)) {
      setSelectedFilters(prev => [...prev, { type, value }]);
    }
  };

  // Remove a filter
  const handleRemoveFilter = (filter: SearchFilterTag) => {
    if (filter.type === 'connection') {
      onClearConnectionFilter();
    } else {
      setSelectedFilters(prev => 
        prev.filter(f => !(f.type === filter.type && f.value === filter.value))
      );
    }
  };

  // Toggle search mode with animation
  const toggleSearchMode = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // If switching TO advanced search, clear all filters
    if (!isAdvancedSearch) {
      setSelectedFilters([]);
      // Keep connection filter if present
      if (connectionPerson) {
        setTimeout(() => {
          setSelectedFilters([{
            type: 'connection',
            value: connectionPerson.id.toString(),
            label: `Connected to: ${connectionPerson.name}`
          }]);
        }, 50);
      }
    }
    
    setIsAdvancedSearch(!isAdvancedSearch);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300); // match animation duration
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Title Section with animated plus sign and glowing magnifying glass */}
      <div className="text-2xl font-bold flex items-center gap-2 mb-2 relative">
        {/* Animated glowing magnifying glass icon */}
        <motion.div
          animate={{
            filter: isAdvancedSearch ? "drop-shadow(0 0 8px rgba(147, 51, 234, 0.7))" : "drop-shadow(0 0 8px rgba(0,0,0, 0.7))",
          }}
          transition={{ 
            duration: 0.75, 
            ease: "easeInOut"
          }}
        >
          <Search className={`h-6 w-6 ${isAdvancedSearch ? "text-purple-600" : "text-purple-600"}`} />
        </motion.div>
        
        <div className="relative">
          <span className="dark:text-white text-black select-none">
            Directory Search
          </span>
          
          {/* Mathematically positioned plus sign */}
          <AnimatePresence>
            {isAdvancedSearch && (
              <div className="absolute" style={{ top: "2px", right: "-8px" }}>
                {/* Plus container for precise measurement */}
                <div className="relative" style={{ width: "10px", height: "10px" }}>
                  {/* Vertical line - precisely centered */}
                  <motion.div 
                    className="absolute bg-black dark:bg-white"
                    style={{ 
                      width: "3px",         // Thicker line
                      height: "0px",        // Initial height
                      left: "50%",          // Center horizontally 
                      top: "0",             // Start from top
                      transform: "translateX(-50%)" // Adjust for line width
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: "10px" }}  // Full height of container
                    exit={{ height: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                  />
                  
                  {/* Horizontal line - precisely centered */}
                  <motion.div 
                    className="absolute bg-black dark:bg-white"
                    style={{ 
                      height: "3px",        // Thicker line
                      width: "0px",         // Initial width
                      top: "50%",           // Center vertically
                      left: "0",            // Start from left
                      transform: "translateY(-50%)" // Adjust for line height
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: "10px" }}  // Full width of container
                    exit={{ width: 0 }}
                    transition={{ duration: 0.35, delay: 0.35, ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Search mode toggle with animated sparkles and text */}
      <div className="flex justify-start">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleSearchMode}
          className={`
            relative overflow-hidden
            ${isAdvancedSearch ? 'border-purple-500' : 'border-gray-300 dark:border-gray-700'}
            group
          `}
        >
          <span className="relative z-10 flex items-center">
            {/* Create a motion.div wrapper for text animation */}
            <motion.div 
              className="flex items-center w-full transition-colors duration-300"
              animate={{ 
                color: isAdvancedSearch ? "#9333ea" : "#64748b"
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {/* Animated sparkles icon */}
              <motion.div
                className="mr-2 flex items-center justify-center transition-colors duration-300"
                animate={{ 
                  color: isAdvancedSearch ? "#9333ea" : "#64748b",
                  scale: isAdvancedSearch ? 1.1 : 1,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <Sparkles 
                  className={`
                    h-4 w-4 transition-all duration-300
                    ${isAdvancedSearch ? "fill-purple-500 stroke-purple-600" : ""} 
                    group-hover:fill-white group-hover:stroke-white
                  `} 
                />
              </motion.div>
              
              {/* Use a span for the text with direct group-hover class */}
              <span className="transition-colors duration-300 group-hover:text-white">
                SuperBloke
              </span>
            </motion.div>
          </span>
          
          {/* Background overlay for hover */}
          <span className="absolute inset-0 bg-purple-600 transform origin-left transition-transform duration-300 ease-out scale-x-0 group-hover:scale-x-100"></span>
        </Button>
      </div>

      {/* Search inputs with animation */}
      <AnimatePresence mode="wait">
        {!isAdvancedSearch ? (
          <motion.div 
            key="simple-search"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            ref={simpleSearchRef}
          >
            <div className="flex flex-wrap gap-4">
              <Input
                placeholder="Search by name, kerberos, or email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 min-w-[250px]"
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
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value=""
                onValueChange={(value) => handleAddFilter('tag', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Add Tag" />
                </SelectTrigger>
                <SelectContent>
                  {relationshipTags.map((tag) => (
                    <SelectItem 
                      key={tag.name} 
                      value={tag.name}
                      className={`${tag.color} rounded-md my-0.5 cursor-pointer transition-colors`}
                    >
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="advanced-search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            ref={advancedSearchRef}
            className="relative"
          >
            <Input
              placeholder="Type a natural language query (e.g., 'Find me CS students who are also in clubs with me')..."
              value={advancedQuery}
              onChange={(e) => setAdvancedQuery(e.target.value)}
              className="w-full pr-10"
            />
            <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applied Filter Tags */}
      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedFilters.map((filter, index) => (
            <FilterTag
              key={`${filter.type}-${filter.value}-${index}`}
              type={filter.type}
              value={filter.value}
              label={filter.label}
              onRemove={() => handleRemoveFilter(filter)}
            />
          ))}
          
          {selectedFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setSelectedFilters([])}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
      
      {/* Search logic explanation */}
      {selectedFilters.length > 1 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
          Showing results matching {selectedFilters.some(f => f.type === 'department') && 'any selected department'}
          {selectedFilters.some(f => f.type === 'department') && selectedFilters.some(f => f.type === 'year') && ' AND '}
          {selectedFilters.some(f => f.type === 'year') && 'any selected year'}
          {(selectedFilters.some(f => f.type === 'department') || selectedFilters.some(f => f.type === 'year')) && 
            selectedFilters.some(f => f.type === 'tag') && ' AND '}
          {selectedFilters.some(f => f.type === 'tag') && 'any selected tag'}
          {(selectedFilters.some(f => f.type === 'department') || 
            selectedFilters.some(f => f.type === 'year') || 
            selectedFilters.some(f => f.type === 'tag')) && 
            selectedFilters.some(f => f.type === 'connection') && ' AND '}
          {selectedFilters.some(f => f.type === 'connection') && 'connected to selected person'}
        </p>
      )}
    </div>
  );
}