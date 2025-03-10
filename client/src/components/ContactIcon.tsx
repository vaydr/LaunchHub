import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { Mail, Linkedin, Instagram, Phone, Check } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";

interface ContactInfoProps {
    email?: string;
    linkedin?: string | null;
    instagram?: string | null;
    phone?: string | null;
  }
  
  interface ContactIconProps {
    value: string | null | undefined;
    type: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    copied: string | null;
    onCopy: (text: string | undefined | null, type: string) => void;
  }
  
  function ContactIcon({ value, type, icon, activeIcon, copied, onCopy }: ContactIconProps) {
    const isActive = !!value;
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            className={`p-1 rounded-full hover:bg-gray-100 ${isActive ? '' : 'opacity-50'}`}
            onClick={() => isActive ? onCopy(value, type) : null}
          >
            {copied === type ? activeIcon : icon}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied === type ? 'Copied!' : value || 'Not provided'}</p>
        </TooltipContent>
      </Tooltip>
    );
  }


function ContactInfo({ email, linkedin, instagram, phone }: ContactInfoProps) {
    const [copied, setCopied] = useState<string | null>(null);
  
    const copyToClipboard = (text: string | undefined | null, type: string) => {
      if (text) {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
      }
    };
  
    const renderIcon = (value: string | null | undefined, type: string, Icon: any) => {
      const isActive = !!value;
      return (
        <Icon className={`h-4 w-4 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
      );
    };
  
    return (
      <div className="flex space-x-2">
        <TooltipProvider>
          <ContactIcon
            value={email}
            type="email"
            icon={renderIcon(email, 'email', Mail)}
            activeIcon={<Check className="h-4 w-4 text-green-500" />}
            copied={copied}
            onCopy={copyToClipboard}
          />
          
          <ContactIcon
            value={linkedin}
            type="linkedin"
            icon={renderIcon(linkedin, 'linkedin', Linkedin)}
            activeIcon={<Check className="h-4 w-4 text-green-500" />}
            copied={copied}
            onCopy={copyToClipboard}
          />
          
          <ContactIcon
            value={instagram}
            type="instagram"
            icon={renderIcon(instagram, 'instagram', Instagram)}
            activeIcon={<Check className="h-4 w-4 text-green-500" />}
            copied={copied}
            onCopy={copyToClipboard}
          />
          
          <ContactIcon
            value={phone}
            type="phone"
            icon={renderIcon(phone, 'phone', Phone)}
            activeIcon={<Check className="h-4 w-4 text-green-500" />}
            copied={copied}
            onCopy={copyToClipboard}
          />
        </TooltipProvider>
      </div>
    );
  }
  
  
  export default ContactIcon;
  export { ContactInfo };