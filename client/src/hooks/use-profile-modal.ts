import { useState, useCallback, useRef } from "react";

interface UseProfileModalResult {
  isProfileOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
  socialCreditScore: number;
}

export default function useProfileModal(): UseProfileModalResult {
  // Profile modal state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Social credit score - random value between 0-1000
  const [socialCreditScore] = useState(() => Math.floor(Math.random() * 1001));
  
  // Ref to prevent multiple state updates
  const isUpdatingProfile = useRef(false);

  // Stable setters
  const openProfile = useCallback(() => {
    if (isUpdatingProfile.current) return;
    isUpdatingProfile.current = true;
    
    // Use setTimeout to add a small delay and prevent multiple state updates
    setTimeout(() => {
      setIsProfileOpen(true);
      isUpdatingProfile.current = false;
    }, 100);
  }, []);
  
  const closeProfile = useCallback(() => {
    if (isUpdatingProfile.current) return;
    isUpdatingProfile.current = true;
    
    // Use setTimeout to add a small delay and prevent multiple state updates
    setTimeout(() => {
      setIsProfileOpen(false);
      isUpdatingProfile.current = false;
    }, 100);
  }, []);

  return {
    isProfileOpen,
    openProfile,
    closeProfile,
    socialCreditScore
  };
} 