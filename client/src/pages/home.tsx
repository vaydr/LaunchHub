import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import WaveBG from "@/components/wavebg";
import Overlay from "@/components/overlay";
import Title from "@/components/title";
import Subtext from "@/components/subtext";
import ActionButton from "@/components/actionbutton";
import AuthModal from "@/components/authmodal";
export default function Home() {
  const [_, setLocation] = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const secondOverlayRef = useRef<HTMLDivElement>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (overlayRef.current && secondOverlayRef.current) {
        const scrolled = window.scrollY;
        const viewportHeight = window.innerHeight;
        const translateY = Math.max(0, viewportHeight - scrolled);
        overlayRef.current.style.transform = `translateY(${translateY}px)`;
        const secondTranslateY = Math.max(0, viewportHeight * 2 - scrolled);
        secondOverlayRef.current.style.transform = `translateY(${secondTranslateY}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sections = [
    {
      title: "Smart Contact Management",
      content: "Keep track of your network within the MIT community with our intelligent contact management system. Never lose touch with important connections."
    },
    {
      title: "Track Meaningful Interactions",
      content: "Record and measure the strength of your interactions. Build stronger relationships over time with smart reminders and insights."
    },
    {
      title: "Future Integrations",
      content: "Coming soon: Connect with Outlook, Gmail, and other platforms to automatically sync your contacts and interactions across all your communication channels."
    }
  ];
  const gradientBackground = {
    background: 'linear-gradient(-45deg, #6600ff, #1a00ff, #9d00ff, #3c00ff, #7700ff, #0033ff)',
    backgroundSize: '300% 300%',
    animation: 'gradient 150s ease infinite',
    zIndex: 20,
  };
  const gradientText = {
    background: 'linear-gradient(-45deg, #6600ff, #1a00ff, #9d00ff, #3c00ff, #7700ff, #0033ff)',
    backgroundSize: '300% 300%',
    animation: 'gradient 150s ease infinite',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const emailIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  );

  const networkIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
    </svg>
  );
  const directoryIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <ellipse cx="10" cy="5" rx="8" ry="3" />
      <ellipse cx="10" cy="10" rx="8" ry="3" />
      <ellipse cx="10" cy="15" rx="8" ry="3" />
    </svg>
  );

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  return (
    <div className="relative min-h-[300vh]">
      <WaveBG />
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Title />
          <Subtext />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex gap-4 justify-center"
          >
            <ActionButton 
              text={isAuthenticated ? "My Network" : "View Network"}
              onClick={() => setLocation("/network")} 
              icon={networkIcon}
              variant={isAuthenticated ? "gradient" : "default"}
            />
            {isAuthenticated ? (
              <ActionButton 
                text="View Directory" 
                onClick={() => setLocation("/contacts")} 
                icon={directoryIcon}
                variant="outline"
              />
            ) : (
              <ActionButton 
                text="Sync Contacts" 
                onClick={() => setShowAuthModal(true)} 
                icon={emailIcon}
                variant="outline"
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={handleAuthSuccess} 
        />
      )}

      {/* First overlay - black background */}
      <Overlay 
        background="white"
        textColor={gradientText}
        sections={sections}
        reference={overlayRef}
      />

      {/* Second overlay - gradient background */}
      <Overlay 
        background={gradientBackground}
        textColor="white"
        sections={sections}
        reference={secondOverlayRef}
      />
    </div>
  );
}
