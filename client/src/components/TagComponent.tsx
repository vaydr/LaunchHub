import React from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Define the relationship tags and their colors in a single source of truth
export const relationshipTags = [
  { name: "Friend", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-800/60" },
  { name: "Classmate", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/60" },
  { name: "Groupmate", color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/60" },
  { name: "Coworker", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800/60" },
  { name: "Mentor", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/60" },
  { name: "Mentee", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/60" },
  { name: "Professor", color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/60" },
  { name: "TA", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800/60" },
  { name: "Advisor", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800/60" },
  { name: "Lab Partner", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-800/60" },
  { name: "Club Member", color: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300 hover:bg-lime-200 dark:hover:bg-lime-800/60" },
  { name: "Research Collaborator", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/60" }
];

// Helper function to get tag color
export const getTagColor = (tagName: string): string => {
  const tag = relationshipTags.find(t => t.name === tagName);
  return tag ? tag.color : "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800/60"; // Default color
};

export interface TagComponentProps {
  tag: string;
  onRemove?: () => void;
  className?: string;
}

const TagComponent: React.FC<TagComponentProps> = ({ 
  tag, 
  onRemove,
  className = ""
}) => {
  const colorClass = getTagColor(tag);
  
  return (
    <div className={`px-3 py-1.5 ${colorClass} text-sm rounded-full flex items-center shadow-sm cursor-pointer transition-colors ${className}`}>
      {tag}
      {onRemove && (
        <button 
          className="ml-2 hover:opacity-80 cursor-pointer"
          onClick={onRemove}
          aria-label={`Remove ${tag} tag`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export interface FilterTagProps {
  type: 'department' | 'year' | 'tag' | 'connection';
  value: string;
  label?: string;
  onRemove?: () => void;
}

export const FilterTag: React.FC<FilterTagProps> = ({
  type,
  value,
  label,
  onRemove
}) => {
  // Get color based on tag type
  let colorClass = '';
  
  if (type === 'tag') {
    colorClass = getTagColor(value);
  } else if (type === 'department') {
    colorClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/60';
  } else if (type === 'year') {
    colorClass = 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/60';
  } else if (type === 'connection') {
    colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/60';
  }
  
  return (
    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm shadow-sm cursor-pointer transition-colors ${colorClass}`}>
      <span>{label || `${type === 'department' ? 'Dept: ' : type === 'year' ? 'Year: ' : ''}${value}`}</span>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 rounded-full hover:bg-black/20 dark:hover:bg-white/20 ml-1 cursor-pointer"
          onClick={onRemove}
          aria-label={`Remove ${type} filter for ${value}`}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default TagComponent; 