import { useState, useEffect } from "react";
import { Mail, Linkedin, Instagram, Phone, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  
  function DetailedContactInfo({ contact, isOpen, onClose, onSave }: DetailedContactInfoProps) {
    const [notes, setNotes] = useState(contact.notes || "");
    const [tags, setTags] = useState<string[]>(contact.tags || []);
    const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
    
    // Update state when contact changes to ensure modal has latest data
    useEffect(() => {
      setNotes(contact.notes || "");
      setTags(contact.tags || []);
    }, [contact]);
    
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
    
    return (
      <div 
        className={`fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 space-y-6 dark:text-white">
            <div className="grid grid-cols-3 gap-6">
              {/* First Column - Profile Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-full overflow-hidden">
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
                
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Interaction Strength: {((contact.interactionStrength || 0)).toFixed(2)}/10
                    </span>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, contact.interactionStrength ? contact.interactionStrength * 10 : 0)}%`,
                          backgroundColor: `rgb(${255 - (contact.interactionStrength || 0) * 25.5}, ${(contact.interactionStrength || 0) * 25.5}, 200)`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Recent Interactions</span>
                    <div className="text-sm mt-1 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
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
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{contact.email}</span>
                  </div>
                  
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  
                  {contact.linkedin && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-gray-500" />
                      <span>{contact.linkedin}</span>
                    </div>
                  )}
                  
                  {contact.instagram && (
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-gray-500" />
                      <span>{contact.instagram}</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg mt-4">
                  <h4 className="font-medium text-amber-800 dark:text-amber-300">Pending Actions</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                      <span>2 unread messages</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                      <span>Suggested: Schedule coffee chat</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Third Column - Actions and Notes */}
              <div className="space-y-4">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </Button>
                
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">Personal Notes</h4>
                  <textarea 
                    className="w-full p-2 h-24 text-sm border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add personal notes about this contact here..."
                  />
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    
                    {tags.map((tag) => (
                      <div key={tag} className={`px-2 py-1 ${getTagColor(tag)} text-xs rounded-full flex items-center`}>
                        {tag}
                        <button 
                          className="ml-1 hover:opacity-80"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    
                    <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                      <PopoverTrigger asChild>
                        <button
                          className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                          aria-label="Add tag"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2 dark:bg-gray-800 dark:border-gray-700">
                        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar overflow-scroll">
                          {availableTags.length > 0 ? (
                            availableTags.map((tag) => (
                              <button
                                key={tag.name}
                                className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${tag.color}`}
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
              <Button onClick={onClose} variant="outline" className="mr-2 dark:border-gray-700 dark:text-gray-300">Cancel</Button>
              <Button onClick={handleSaveChanges} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">Save</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default DetailedContactInfo;

  export { relationshipTags };