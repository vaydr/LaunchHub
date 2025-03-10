import { useState } from "react";
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
    { name: "Friend", color: "bg-pink-100 text-pink-800" },
    { name: "Classmate", color: "bg-blue-100 text-blue-800" },
    { name: "Groupmate", color: "bg-green-100 text-green-800" },
    { name: "Coworker", color: "bg-yellow-100 text-yellow-800" },
    { name: "Mentor", color: "bg-indigo-100 text-indigo-800" },
    { name: "Mentee", color: "bg-purple-100 text-purple-800" },
    { name: "Professor", color: "bg-red-100 text-red-800" },
    { name: "TA", color: "bg-orange-100 text-orange-800" },
    { name: "Advisor", color: "bg-teal-100 text-teal-800" },
    { name: "Lab Partner", color: "bg-cyan-100 text-cyan-800" },
    { name: "Club Member", color: "bg-lime-100 text-lime-800" },
    { name: "Research Collaborator", color: "bg-amber-100 text-amber-800" }
  ];
  
  function DetailedContactInfo({ contact, isOpen, onClose, onSave }: DetailedContactInfoProps) {
    const [notes, setNotes] = useState(contact.notes || "");
    const [tags, setTags] = useState<string[]>(contact.tags || []);
    const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
    
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
    
    return isOpen ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
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
                  <p className="text-gray-500">{contact.role} {contact.year ? `· ${contact.year}` : ""}</p>
                </div>
              </div>
              
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="mb-2">
                  <span className="text-sm text-gray-500">
                    Interaction Strength: {((contact.interactionStrength || 0)).toFixed(2)}/10
                  </span>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-purple-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, contact.interactionStrength ? contact.interactionStrength * 10 : 0)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Recent Interactions</span>
                  <div className="text-sm mt-1 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                    {contact.interactionSummary || "No recent interactions recorded."}
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
              
              <div className="bg-amber-50 p-3 rounded-lg mt-4">
                <h4 className="font-medium text-amber-800">Pending Actions</h4>
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
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <span className="mr-2">✨</span> Reach out to MEET
              </Button>
              
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <textarea
                  className="w-full p-2 border rounded-md text-sm h-32 overflow-y-auto custom-scrollbar"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes here..."
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
                      <button className="p-1 bg-gray-100 rounded-full hover:bg-gray-200">
                        <Plus className="h-4 w-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2">
                      <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar overflow-scroll">
                        {availableTags.length > 0 ? (
                          availableTags.map((tag) => (
                            <button
                              key={tag.name}
                              className={`w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded ${tag.color}`}
                              onClick={() => addTag(tag.name)}
                            >
                              {tag.name}
                            </button>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 px-2 py-1">All tags already selected</p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={onClose} variant="outline" className="mr-2">Cancel</Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        </div>
      </div>
    ) : null;
  }
  
  export default DetailedContactInfo;

  export { relationshipTags };