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

const TAGS = [
  "Friend",
  "Classmate", 
  "Groupmate",
  "Coworker",
  "Mentor",
  "Mentee",
  "Professor",
  "TA",
  "Advisor",
  "Lab Partner",
  "Club Member",
  "Research Collaborator"
];

// Filter tag type
interface FilterTag {
  type: 'department' | 'year' | 'tag' | 'connection';
  value: string;
  label?: string;
  color?: string;
}

// Props for the component
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
  const [selectedFilters, setSelectedFilters] = useState<FilterTag[]>([]);
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
          label: `Connected to: ${connectionPerson.name}`,
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        }];
      });
    } else {
      setSelectedFilters(prev => prev.filter(f => f.type !== 'connection'));
    }
  }, [connectionPerson]);

  // Add a filter with OR logic within category
  const handleAddFilter = (type: 'department' | 'year' | 'tag', value: string) => {
    // Only add if not already present
    if (!selectedFilters.some(f => f.type === type && f.value === value)) {
      let color = '';
      
      // Special styling for tags
      if (type === 'tag') {
        switch (value) {
          case 'Friend': color = 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'; break;
          case 'Classmate': color = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'; break;
          case 'Groupmate': color = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'; break;
          case 'Coworker': color = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'; break;
          case 'Mentor': color = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'; break;
          case 'Mentee': color = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'; break;
          case 'Professor': color = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'; break;
          case 'TA': color = 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'; break;
          case 'Advisor': color = 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'; break;
          case 'Lab Partner': color = 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300'; break;
          default: color = 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
      } else if (type === 'department') {
        color = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      } else if (type === 'year') {
        color = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      }
      
      setSelectedFilters(prev => [...prev, { type, value, color }]);
    }
  };

  // Remove a filter
  const handleRemoveFilter = (filter: FilterTag) => {
    if (filter.type === 'connection') {
      onClearConnectionFilter();
    } else {
      setSelectedFilters(prev => 
        prev.filter(f => !(f.type === filter.type && f.value === filter.value))
      );
    }
  };

  // Modify the toggleSearchMode function to respect animation state
  const toggleSearchMode = () => {
    if (isAnimating) return; // Prevent spamming
    
    setIsAnimating(true);
    setIsAdvancedSearch(prev => !prev);
    
    // Release animation lock after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 800); // Slightly longer than animation duration
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
      {/* Search mode toggle */}
      <div className="flex justify-start">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleSearchMode}
          className="relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center group-hover:text-white transition-colors duration-300">
            {isAdvancedSearch ? 
              <><Search className="h-4 w-4 mr-2" /> Simple Search</> : 
              <><Sparkles className="h-4 w-4 mr-2" /> Advanced Search</>
            }
          </span>
          
          {/* Background overlay that transitions to purple */}
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
                  {TAGS.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
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
            <div
              key={`${filter.type}-${filter.value}-${index}`}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm shadow-sm 
                         ${filter.color || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
            >
              <span>{filter.label || `${filter.type === 'department' ? 'Dept: ' : filter.type === 'year' ? 'Year: ' : ''}${filter.value}`}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ml-1"
                onClick={() => handleRemoveFilter(filter)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
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