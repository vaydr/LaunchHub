import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Mail, 
  Linkedin, 
  Instagram, 
  Phone, 
  Plus, 
  X,
  CheckCircle,
  Mail as MailIcon,
  User,
  MapPin,
  Building,
  GraduationCap,
  Calendar,
  Link,
  Clock,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import InteractionStats, { generateSampleStats } from "./InteractionStats";
import TagComponent, { relationshipTags } from "./TagComponent";
import type { Contact } from "@shared/schema";

interface DetailedContactInfoProps {
    contact: Contact;
    isOpen: boolean;
    onClose: () => void;
    
    onSave: (updatedContact: Contact) => void;
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
    
    // Generate interaction stats using the new component's function
    const interactionStats = useMemo(() => generateSampleStats(), []);
    
    // Mock data for action items
    const actionItems = [
      { text: "Follow up on email about research project", priority: "high" },
      { text: "Share course notes from last lecture", priority: "medium" },
      { text: "Ask about upcoming department event", priority: "low" }
    ];
    
    const handleSaveChanges = useCallback(() => {
      const updatedContact = {
        ...contact,
        notes,
        tags
      };
      onSave(updatedContact);
      onClose();
    }, [contact, notes, tags, onSave, onClose]);
    
    const addTag = useCallback((tag: string) => {
      if (!tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setIsTagPopoverOpen(false);
    }, [tags, setTags]);
    
    const removeTag = useCallback((tagToRemove: string) => {
      setTags(tags.filter(tag => tag !== tagToRemove));
    }, [tags, setTags]);
    
    // Filter available tags to exclude already selected ones
    const availableTags = relationshipTags.filter(tag => !tags.includes(tag.name));
    
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
    
    // Get rating category based on value and direction
    const getRatingCategory = (value: number, maxValue: number, direction: string): number => {
      // Get the threshold values (same as used in descriptions)
      const thresholds = [0.1, 0.25, 0.4, 0.6, 0.75, 0.9].map(t => Math.round(t * maxValue));
      
      if (direction === 'ascending') {
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
                          backgroundColor: `rgb(${getCategoryColorRGB(getRatingCategory(contact.interactionStrength || 0, 10, 'ascending'))})`
                        }}
                      ></div>
                    </div>
                    <div className="text-xs flex justify-end mt-1 items-center gap-1">
                      <span>
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
                  
                  {/* New InteractionStats component */}
                  <div className="mb-4">
                    <InteractionStats stats={interactionStats} />
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
                      <TagComponent 
                        key={tag} 
                        tag={tag} 
                        onRemove={() => removeTag(tag)} 
                      />
                    ))}
                    
                    <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                      <PopoverTrigger asChild>
                        <button
                          className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer"
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
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${tag.color} cursor-pointer transition-colors`}
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
  
  const MemoizedDetailedContactInfo = React.memo(DetailedContactInfo);

  export default MemoizedDetailedContactInfo;