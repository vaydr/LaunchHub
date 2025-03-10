import { useState, useEffect, useMemo } from "react";
import { 
  Mail, 
  Linkedin, 
  Instagram, 
  Phone, 
  Plus, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  AlertTriangle, 
  ChevronsUp, 
  ChevronsDown, 
  ArrowUpFromLine, 
  ArrowDownToLine,
  Minus,
  CheckCircle,
  Mail as MailIcon,
  MessageCircle,
  Users,
  Calendar,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Contact } from "@shared/schema";

interface DetailedContactInfoProps {
    contact: Contact;
    isOpen: boolean;
    onClose: () => void;
    
    onSave: (updatedContact: Contact) => void;
  }
  
  // Available relationship tags with their colors
  const relationshipTags = [
    { name: "Friend", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300" },
    { name: "Classmate", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
    { name: "Groupmate", color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
    { name: "Coworker", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300" },
    { name: "Mentor", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300" },
    { name: "Mentee", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" },
    { name: "Professor", color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
    { name: "TA", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
    { name: "Advisor", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300" },
    { name: "Lab Partner", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300" },
    { name: "Club Member", color: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300" },
    { name: "Research Collaborator", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" }
  ];
  
  // Enum for metric direction
  enum MetricDirection {
    ASCENDING = "ascending", // Higher is better (communities, mutual contacts)
    DESCENDING = "descending" // Lower is better (unread messages)
  }
  
  // Interface for a metric
  interface InteractionMetric {
    title: string;
    value: number;
    maxValue: number;
    icon: React.ReactNode;
    direction: MetricDirection;
  }
  
  function DetailedContactInfo({ contact, isOpen, onClose, onSave }: DetailedContactInfoProps) {
    const [notes, setNotes] = useState(contact.notes || "");
    const [tags, setTags] = useState<string[]>(contact.tags || []);
    const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
    
    // Update state when contact changes to ensure modal has latest data
    useEffect(() => {
      setNotes(contact.notes || "");
      setTags(contact.tags || []);
    }, [contact]);
    
    // Generate randomized interaction stats with appropriate ranges
    const interactionStats = useMemo<InteractionMetric[]>(() => {
      // Helper function to get random integer in range (inclusive)
      const getRandomInRange = (min: number, max: number) => 
        Math.floor(Math.random() * (max - min + 1)) + min;

      return [
        { 
          title: "Shared Communities", 
          value: getRandomInRange(1, 10),
          maxValue: 10,
          icon: <Users className="h-4 w-4" />,
          direction: MetricDirection.ASCENDING
        },
        { 
          title: "Mutual Contacts", 
          value: getRandomInRange(3, 15),
          maxValue: 20,
          icon: <Users className="h-4 w-4" />,
          direction: MetricDirection.ASCENDING
        },
        { 
          title: "Unread Messages", 
          value: getRandomInRange(0, 8),
          maxValue: 10,
          icon: <MessageCircle className="h-4 w-4" />,
          direction: MetricDirection.DESCENDING
        },
        { 
          title: "Meetings Attended", 
          value: getRandomInRange(2, 10),
          maxValue: 10,
          icon: <Calendar className="h-4 w-4" />,
          direction: MetricDirection.ASCENDING
        }
      ];
    }, []);
    
    // Mock data for action items
    const actionItems = [
      { text: "Follow up on email about research project", priority: "high" },
      { text: "Share course notes from last lecture", priority: "medium" },
      { text: "Ask about upcoming department event", priority: "low" }
    ];
    
    const handleSaveChanges = () => {
      const updatedContact = {
        ...contact,
        notes,
        tags
      };
      onSave(updatedContact);
      onClose();
    };
    
    const addTag = (tag: string) => {
      if (!tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setIsTagPopoverOpen(false);
    };
    
    const removeTag = (tagToRemove: string) => {
      setTags(tags.filter(tag => tag !== tagToRemove));
    };
    
    // Filter available tags to exclude already selected ones
    const availableTags = relationshipTags.filter(tag => !tags.includes(tag.name));
    
    // Get color for a tag
    const getTagColor = (tagName: string) => {
      const tag = relationshipTags.find(t => t.name === tagName);
      return tag ? tag.color : "bg-purple-100 text-purple-800"; // Default color
    };
    
    // Get interaction strength rating text
    const getInteractionRating = (strength: number) => {
      if (strength < 1.43) return "Very Poor";
      if (strength < 2.86) return "Poor";
      if (strength < 4.29) return "Fair";
      if (strength < 5.71) return "Moderate";
      if (strength < 7.14) return "Good";
      if (strength < 8.57) return "Very Good";
      return "Excellent";
    };
    
    // Get appropriate unit for the metric
    const getUnitForMetric = (metric: InteractionMetric): string => {
      const title = metric.title.toLowerCase();
      if (title.includes('messages')) return 'messages';
      if (title.includes('communities')) return 'communities';
      if (title.includes('contacts') || title.includes('mutuals')) return 'contacts';
      if (title.includes('meetings')) return 'meetings';
      if (title.includes('time')) return 'days';
      return '';
    };
    
    // Get rating category based on value and direction
    const getRatingCategory = (value: number, maxValue: number, direction: MetricDirection): number => {
      // Get the threshold values (same as used in descriptions)
      const thresholds = [0.1, 0.25, 0.4, 0.6, 0.75, 0.9].map(t => Math.round(t * maxValue));
      
      if (direction === MetricDirection.ASCENDING) {
        // For ascending metrics (higher is better)
        if (value <= thresholds[0]) return -3; // Triple negative: 0-threshold[0]
        if (value <= thresholds[1]) return -2; // Double negative: threshold[0]+1 to threshold[1]
        if (value <= thresholds[2]) return -1; // Single negative: threshold[1]+1 to threshold[2]
        if (value <= thresholds[3]) return 0;  // Neutral: threshold[2]+1 to threshold[3]
        if (value <= thresholds[4]) return 1;  // Single positive: threshold[3]+1 to threshold[4]
        if (value <= thresholds[5]) return 2;  // Double positive: threshold[4]+1 to threshold[5]
        return 3; // Triple positive: threshold[5]+1 and above
      } else {
        // For descending metrics (lower is better)
        if (value <= thresholds[0]) return 3;  // Triple positive: 0-threshold[0]
        if (value <= thresholds[1]) return 2;  // Double positive: threshold[0]+1 to threshold[1]
        if (value <= thresholds[2]) return 1;  // Single positive: threshold[1]+1 to threshold[2]
        if (value <= thresholds[3]) return 0;  // Neutral: threshold[2]+1 to threshold[3]
        if (value <= thresholds[4]) return -1; // Single negative: threshold[3]+1 to threshold[4]
        if (value <= thresholds[5]) return -2; // Double negative: threshold[4]+1 to threshold[5]
        return -3; // Triple negative: threshold[5]+1 and above
      }
    };
    
    // Get all category descriptions for a metric
    const getCategoryDescriptions = (metric: InteractionMetric) => {
      const title = metric.title.toLowerCase();
      const maxValue = metric.maxValue;
      const unit = getUnitForMetric(metric);
      const direction = metric.direction;
      
      // Calculate threshold values as integers
      const thresholds = [0.1, 0.25, 0.4, 0.6, 0.75, 0.9].map(t => Math.round(t * maxValue));
      
      if (direction === MetricDirection.ASCENDING) {
        // For ascending metrics (HIGHER is BETTER)
        return [
          { name: "Triple positive", range: `${thresholds[5] + 1}+ ${unit}`, description: `Excellent ${title} metrics` },
          { name: "Double positive", range: `${thresholds[4] + 1}-${thresholds[5]} ${unit}`, description: `Very good ${title} count` },
          { name: "Single positive", range: `${thresholds[3] + 1}-${thresholds[4]} ${unit}`, description: `Good number of ${title}` },
          { name: "Neutral", range: `${thresholds[2] + 1}-${thresholds[3]} ${unit}`, description: `Average number of ${title}` },
          { name: "Single negative", range: `${thresholds[1] + 1}-${thresholds[2]} ${unit}`, description: `Below average ${title}` },
          { name: "Double negative", range: `${thresholds[0] + 1}-${thresholds[1]} ${unit}`, description: `Warning: Low number of ${title}` },
          { name: "Triple negative", range: `0-${thresholds[0]} ${unit}`, description: `Critical: Very low number of ${title}` }
        ];
      } else {
        // For descending metrics (LOWER is BETTER)
        return [
          { name: "Triple positive", range: `0-${thresholds[0]} ${unit}`, description: `Excellent: Very few ${title}` },
          { name: "Double positive", range: `${thresholds[0] + 1}-${thresholds[1]} ${unit}`, description: `Very good: Low number of ${title}` },
          { name: "Single positive", range: `${thresholds[1] + 1}-${thresholds[2]} ${unit}`, description: `Good: Below average ${title}` },
          { name: "Neutral", range: `${thresholds[2] + 1}-${thresholds[3]} ${unit}`, description: `Average number of ${title}` },
          { name: "Single negative", range: `${thresholds[3] + 1}-${thresholds[4]} ${unit}`, description: `Warning: Above average ${title}` },
          { name: "Double negative", range: `${thresholds[4] + 1}-${thresholds[5]} ${unit}`, description: `High alert: Too many ${title}` },
          { name: "Triple negative", range: `${thresholds[5] + 1}+ ${unit}`, description: `Critical: Excessive ${title}` }
        ];
      }
    };
    
    // Get tooltip header message based on category and metric
    const getCategoryTooltip = (category: number, metric: InteractionMetric): string => {
      const title = metric.title.toLowerCase();
      const direction = metric.direction;
      
      if (direction === MetricDirection.ASCENDING) {
        // For ascending metrics (higher is better)
        switch (category) {
          case -3: return `Critical: Very low number of ${title}. Immediate attention needed.`;
          case -2: return `Warning: Low number of ${title}. Consider increasing engagement.`;
          case -1: return `Below average ${title}. Slight improvement recommended.`;
          case 0: return `Average number of ${title}.`;
          case 1: return `Good number of ${title}. Slightly above average.`;
          case 2: return `Very good ${title} count. Strong engagement.`;
          case 3: return `Excellent ${title} metrics. Exceptional connection.`;
          default: return `Information about ${title}.`;
        }
      } else {
        // For descending metrics (lower is better)
        switch (category) {
          case 3: return `Excellent: Very few ${title}. Keep it up!`;
          case 2: return `Very good: Low number of ${title}.`;
          case 1: return `Good: Below average ${title}.`;
          case 0: return `Average number of ${title}.`;
          case -1: return `Warning: Above average ${title}. Consider responding soon.`;
          case -2: return `High alert: Too many ${title}. Action needed.`;
          case -3: return `Critical: Excessive ${title}. Immediate attention required.`;
          default: return `Information about ${title}.`;
        }
      }
    };
    
    // Get icon based on category
    const getCategoryIcon = (category: number, className: string = "h-4 w-4") => {
      switch (category) {
        case -3: 
          return <ArrowDownToLine className={`${className} text-red-600`} />;
        case -2: 
          return <ChevronsDown className={`${className} text-red-500`} />;
        case -1: 
          return <ArrowDown className={`${className} text-red-400`} />;
        case 0: 
          return <Minus className={`${className} text-gray-400`} />;
        case 1: 
          return <ArrowUp className={`${className} text-green-400`} />;
        case 2:
          return <ChevronsUp className={`${className} text-green-500`} />;
        case 3:
          return <ArrowUpFromLine className={`${className} text-green-600`} />;
        default:
          return <Minus className={`${className} text-gray-400`} />;
      }
    };
    
    // Get color based on category
    const getCategoryColor = (category: number) => {
      switch (category) {
        case -3: return "text-red-600";
        case -2: return "text-red-500";
        case -1: return "text-red-400";
        case 0: return "text-gray-500";
        case 1: return "text-green-400";
        case 2: return "text-green-500";
        case 3: return "text-green-600";
        default: return "text-gray-500";
      }
    };
    
    // Get background color based on category
    const getCategoryBgColor = (category: number) => {
      switch (category) {
        case -3: return "bg-red-100 dark:bg-red-900/30";
        case -2: return "bg-red-50 dark:bg-red-800/20";
        case -1: return "bg-red-50/50 dark:bg-red-800/10";
        case 0: return "bg-gray-100 dark:bg-gray-800";
        case 1: return "bg-green-50/50 dark:bg-green-800/10";
        case 2: return "bg-green-50 dark:bg-green-800/20";
        case 3: return "bg-green-100 dark:bg-green-900/30";
        default: return "bg-gray-100 dark:bg-gray-800";
      }
    };
    
    // Get actual RGB color values for a category
    const getCategoryColorRGB = (category: number): string => {
      switch (category) {
        case 3: return "75, 180, 80"; // Green for triple positive
        case 2: return "95, 200, 100"; // Light green for double positive
        case 1: return "150, 210, 120"; // Pale green for single positive
        case 0: return "150, 150, 150"; // Gray for neutral
        case -1: return "240, 150, 120"; // Pale red for single negative
        case -2: return "240, 120, 90"; // Light red for double negative
        case -3: return "240, 80, 70"; // Red for triple negative
        default: return "150, 150, 150"; // Default gray
      }
    };
    
    // Reusable component for metric tooltip
    const MetricTooltip = ({ metric, category }: { metric: InteractionMetric, category: number }) => {
      return (
        <TooltipContent side="left" className="p-4 max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">
              {getCategoryTooltip(category, metric)}
            </p>
            <div className="text-xs pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="font-medium mb-2">Interaction Impact:</p>
              <div className="grid grid-cols-1 gap-2">
                {getCategoryDescriptions(metric).map((catDesc, i) => {
                  // Map array index to category value based on direction
                  const catValue = metric.direction === MetricDirection.ASCENDING
                    ? 3 - i  // Ascending: 0=Triple positive(+3), 6=Triple negative(-3)
                    : i === 0 ? 3 : i === 1 ? 2 : i === 2 ? 1 : i === 3 ? 0 : i === 4 ? -1 : i === 5 ? -2 : -3; // Descending
                  
                  return (
                    <div 
                      key={i} 
                      className={`flex items-center gap-2 py-1 px-2 rounded ${
                        category === catValue ? 'bg-gray-100 dark:bg-gray-800 font-medium' : ''
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {getCategoryIcon(catValue, "h-4 w-4")}
                      </div>
                      <span className="flex-grow text-xs">{catDesc.range}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TooltipContent>
      );
    };
    
    // Reusable component for a single metric
    const MetricDisplay = ({ metric }: { metric: InteractionMetric }) => {
      const category = getRatingCategory(metric.value, metric.maxValue, metric.direction);
      
      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {metric.icon}
            <span className="text-sm">
              <span className="font-bold">{metric.value}</span> {metric.title.toLowerCase()}
            </span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center">
                  {getCategoryIcon(category)}
                </div>
              </TooltipTrigger>
              <MetricTooltip metric={metric} category={category} />
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    };
    
    return (
      <div 
        className={`fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[90%] max-w-4xl max-h-[95vh] overflow-y-auto">
          <div className="p-6 space-y-6 dark:text-white">
            <div className="grid grid-cols-3 gap-6 min-h-[70vh]">
              {/* First Column - Profile Information */}
              <div className="space-y-6 flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="h-20 w-20 rounded-full overflow-hidden">
                    <img 
                      src={contact.picture || "https://via.placeholder.com/150"} 
                      alt={contact.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{contact.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{contact.role} {contact.year ? `· ${contact.year}` : ""}</p>
                  </div>
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex-grow">
                  <div className="mb-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Interaction Strength: {((contact.interactionStrength || 0)).toFixed(2)}/10
                    </span>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                      <div 
                        className="h-2.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, contact.interactionStrength ? contact.interactionStrength * 10 : 0)}%`,
                          backgroundColor: `rgb(${getCategoryColorRGB(getRatingCategory(contact.interactionStrength || 0, 10, MetricDirection.ASCENDING))})`
                        }}
                      ></div>
                    </div>
                    <div className="text-xs flex justify-end mt-1 items-center gap-1">
                      {getCategoryIcon(getRatingCategory(contact.interactionStrength || 0, 10, MetricDirection.ASCENDING))}
                      <span className={getCategoryColor(getRatingCategory(contact.interactionStrength || 0, 10, MetricDirection.ASCENDING))}>
                        {getInteractionRating(contact.interactionStrength || 0)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Recent Interactions */}
                  <div className="flex-grow">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Recent Interactions</span>
                    <div className="text-sm mt-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {contact.interactionSummary ? (
                        <p>{contact.interactionSummary}</p>
                      ) : (
                        <p className="text-gray-400 dark:text-gray-500">No recent interactions logged</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Second Column - Contact Information */}
              <div className="space-y-5 flex flex-col">
                <h3 className="font-semibold text-lg">Contact Information</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <span>{contact.email}</span>
                  </div>
                  
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  
                  {contact.linkedin && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-5 w-5 text-gray-500" />
                      <span>{contact.linkedin}</span>
                    </div>
                  )}
                  
                  {contact.instagram && (
                    <div className="flex items-center gap-2">
                      <Instagram className="h-5 w-5 text-gray-500" />
                      <span>{contact.instagram}</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg mt-4 flex-grow">
                  <h4 className="font-medium text-slate-800 dark:text-slate-200 text-lg mb-3">Interaction Status</h4>
                  
                  {/* Interaction Stats in the interaction status section */}
                  <div className="space-y-3 mb-4">
                    {/* Only show first 3 stats as requested */}
                    {interactionStats.slice(0, 3).map((metric, i) => (
                      <MetricDisplay key={i} metric={metric} />
                    ))}
                  </div>
                  
                  {/* Suggested Follow-ups in the interaction status section */}
                  <h5 className="font-medium text-slate-700 dark:text-slate-300 text-sm mb-2">Suggested Follow-ups</h5>
                  <ul className="space-y-3 text-sm">
                    {actionItems.map((item, i) => {
                      const bulletColor = 
                        item.priority === "high" ? "bg-red-500" : 
                        item.priority === "medium" ? "bg-blue-500" : 
                        "bg-green-500";
                      
                      return (
                        <li key={i} className="flex items-start gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full mt-1.5 ${bulletColor}`}></span>
                          <span>{item.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
              
              {/* Third Column - Actions and Notes */}
              <div className="space-y-6 flex flex-col">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 text-lg"
                  onClick={handleSaveChanges}
                >
                  Reach out to {contact.name}
                </Button>
                
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex-grow">
                  <h4 className="font-medium mb-3 text-lg">Personal Notes</h4>
                  <textarea 
                    className="w-full p-3 h-48 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add personal notes about this contact here..."
                  />
                </div>
                
                <div className="flex-grow">
                  <h4 className="font-medium mb-3 text-lg">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    
                    {tags.map((tag) => (
                      <div key={tag} className={`px-3 py-1.5 ${getTagColor(tag)} text-sm rounded-full flex items-center`}>
                        {tag}
                        <button 
                          className="ml-2 hover:opacity-80"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    
                    <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                      <PopoverTrigger asChild>
                        <button
                          className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                          aria-label="Add tag"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2 dark:bg-gray-800 dark:border-gray-700">
                        <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar overflow-scroll">
                          {availableTags.length > 0 ? (
                            availableTags.map((tag) => (
                              <button
                                key={tag.name}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${tag.color}`}
                                onClick={() => addTag(tag.name)}
                              >
                                {tag.name}
                              </button>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 px-2 py-1">All tags already selected</p>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={onClose} variant="outline" className="mr-2 dark:border-gray-700 dark:text-gray-300 px-6 py-2">Cancel</Button>
              <Button onClick={handleSaveChanges} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-2">Save</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default DetailedContactInfo;

  export { relationshipTags };