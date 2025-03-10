import React, { useState } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ChevronUp, 
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Minus,
  Users,
  MessageCircle,
  Calendar
} from 'lucide-react';

// Interface for a metric
export interface InteractionMetric {
  title: string;
  value: number;
  maxValue: number;
  icon: React.ReactNode;
  direction: 'ascending' | 'descending';
}

interface InteractionStatsProps {
  stats: InteractionMetric[];
}

// Generate sample interaction stats
export const generateSampleStats = (): InteractionMetric[] => {
  // Helper function to get random integer in range (inclusive)
  const getRandomInRange = (min: number, max: number) => 
    Math.floor(Math.random() * (max - min + 1)) + min;

  return [
    { 
      title: "Shared Communities", 
      value: getRandomInRange(1, 10),
      maxValue: 10,
      icon: <Users className="h-4 w-4" />,
      direction: 'ascending'
    },
    { 
      title: "Mutual Contacts", 
      value: getRandomInRange(3, 15),
      maxValue: 20,
      icon: <Users className="h-4 w-4" />,
      direction: 'ascending'
    },
    { 
      title: "Unread Messages", 
      value: getRandomInRange(0, 8),
      maxValue: 10,
      icon: <MessageCircle className="h-4 w-4" />,
      direction: 'descending'
    },
    { 
      title: "Meetings Attended", 
      value: getRandomInRange(2, 10),
      maxValue: 10,
      icon: <Calendar className="h-4 w-4" />,
      direction: 'ascending'
    }
  ];
}

// Individual metric display
const MetricDisplay = ({ metric }: { metric: InteractionMetric }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const rating = getRating(metric.value, metric.maxValue, metric.direction);
  
  return (
    <div className="flex items-center justify-between group relative">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">{metric.icon}</span>
        <span className="text-sm">
          <span className="font-medium">{metric.value}</span> {metric.title.toLowerCase()}
        </span>
      </div>
      
      <div 
        className="flex items-center p-1.5 cursor-help hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {getRatingIcon(rating)}
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-4 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 w-64">
            <div className="space-y-2">
              <p className="font-medium">{getRatingDescription(rating, metric)}</p>
              
              <div className="text-xs pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="font-medium mb-2">Integration Impact:</p>
                <div className="grid grid-cols-1 gap-2">
                  {getBucketDescriptions(metric).map((desc, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center gap-2 py-1 px-2 rounded ${
                        rating === desc.rating ? getRatingBackgroundColor(desc.rating, true) + ' font-medium' : ''
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {getRatingIcon(desc.rating)}
                      </div>
                      <div className="flex-grow">
                        <span className="font-medium block">{desc.name}</span>
                        <span className="text-xs text-gray-500">{desc.range}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Convert a value to one of 5 ratings: -2, -1, 0, 1, 2
function getRating(value: number, maxValue: number, direction: string): number {
  // Calculate threshold values as percentages of max
  const thresholds = [0.2, 0.4, 0.6, 0.8].map(t => Math.round(t * maxValue));
  
  if (direction === 'ascending') {
    // For ascending metrics (higher is better)
    if (value <= thresholds[0]) return -2; // Very Poor
    if (value <= thresholds[1]) return -1; // Poor
    if (value <= thresholds[2]) return 0;  // Fair
    if (value <= thresholds[3]) return 1;  // Good
    return 2; // Very Good
  } else {
    // For descending metrics (lower is better)
    if (value <= thresholds[0]) return 2;  // Very Good
    if (value <= thresholds[1]) return 1;  // Good
    if (value <= thresholds[2]) return 0;  // Fair
    if (value <= thresholds[3]) return -1; // Poor
    return -2; // Very Poor
  }
}

// Get icon based on rating
function getRatingIcon(rating: number) {
  switch (rating) {
    case -2: return <ChevronsDown className="h-4 w-4 text-red-600" />;
    case -1: return <ChevronDown className="h-4 w-4 text-red-400" />;
    case 0: return <Minus className="h-4 w-4 text-gray-400" />;
    case 1: return <ChevronUp className="h-4 w-4 text-green-400" />;
    case 2: return <ChevronsUp className="h-4 w-4 text-green-600" />;
    default: return <Minus className="h-4 w-4 text-gray-400" />;
  }
}

// Get description text based on rating and metric
function getRatingDescription(rating: number, metric: InteractionMetric): string {
  const title = metric.title.toLowerCase();
  
  if (metric.direction === 'ascending') {
    // For ascending metrics (higher is better)
    switch (rating) {
      case -2: return `Very poor number of ${title}. Immediate attention needed.`;
      case -1: return `Below average ${title}. Consider increasing engagement.`;
      case 0: return `Fair number of ${title}.`;
      case 1: return `Good number of ${title}. Above average.`;
      case 2: return `Excellent ${title} metrics. Outstanding connection.`;
      default: return `Information about ${title}.`;
    }
  } else {
    // For descending metrics (lower is better)
    switch (rating) {
      case 2: return `Excellent: Very few ${title}. Perfect management.`;
      case 1: return `Good: Low number of ${title}.`;
      case 0: return `Fair number of ${title}.`;
      case -1: return `High number of ${title}. Consider responding soon.`;
      case -2: return `Too many ${title}. Immediate attention required.`;
      default: return `Information about ${title}.`;
    }
  }
}

// Get appropriate unit for the metric
function getUnitForMetric(metric: InteractionMetric): string {
  const title = metric.title.toLowerCase();
  if (title.includes('messages')) return 'messages';
  if (title.includes('communities')) return 'communities';
  if (title.includes('contacts') || title.includes('mutual')) return 'contacts';
  if (title.includes('meetings')) return 'meetings';
  return '';
}

// Get bucket descriptions for a metric
function getBucketDescriptions(metric: InteractionMetric) {
  const unit = getUnitForMetric(metric);
  const maxValue = metric.maxValue;
  const thresholds = [0.2, 0.4, 0.6, 0.8].map(t => Math.round(t * maxValue));
  
  if (metric.direction === 'ascending') {
    return [
      { rating: 2, name: 'Very Good', range: `${thresholds[3] + 1}+ ${unit}` },
      { rating: 1, name: 'Good', range: `${thresholds[2] + 1}-${thresholds[3]} ${unit}` },
      { rating: 0, name: 'Fair', range: `${thresholds[1] + 1}-${thresholds[2]} ${unit}` },
      { rating: -1, name: 'Poor', range: `${thresholds[0] + 1}-${thresholds[1]} ${unit}` },
      { rating: -2, name: 'Very Poor', range: `0-${thresholds[0]} ${unit}` }
    ];
  } else {
    return [
      { rating: 2, name: 'Very Good', range: `0-${thresholds[0]} ${unit}` },
      { rating: 1, name: 'Good', range: `${thresholds[0] + 1}-${thresholds[1]} ${unit}` },
      { rating: 0, name: 'Fair', range: `${thresholds[1] + 1}-${thresholds[2]} ${unit}` },
      { rating: -1, name: 'Poor', range: `${thresholds[2] + 1}-${thresholds[3]} ${unit}` },
      { rating: -2, name: 'Very Poor', range: `${thresholds[3] + 1}+ ${unit}` }
    ];
  }
}

// Add a function to get background color based on rating
function getRatingBackgroundColor(rating: number, isSelected: boolean = false) {
  if (!isSelected) return '';
  
  switch (rating) {
    case -2: return 'bg-red-100 dark:bg-red-900/30'; // Very Poor
    case -1: return 'bg-red-50 dark:bg-red-800/20'; // Poor
    case 0: return 'bg-gray-100 dark:bg-gray-500/20'; // Fair - changed to amber/yellow
    case 1: return 'bg-green-50 dark:bg-green-800/20'; // Good
    case 2: return 'bg-green-100 dark:bg-green-900/30'; // Very Good
    default: return 'bg-gray-100 dark:bg-gray-800';
  }
}

// Main component
export default function InteractionStats({ stats }: InteractionStatsProps) {
  return (
    <div className="space-y-3">
      {stats.map((metric, i) => (
        <MetricDisplay key={i} metric={metric} />
      ))}
    </div>
  );
} 