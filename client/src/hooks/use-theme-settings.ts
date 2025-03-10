import { useState, useEffect, useCallback, useRef } from "react";

const ITEMS_PER_PAGE_DEFAULT = 10;

interface UseThemeSettingsResult {
  theme: 'light' | 'dark';
  itemsPerPage: number;
  isSettingsOpen: boolean;
  tempTheme: 'light' | 'dark';
  tempItemsPerPage: number;
  openSettings: () => void;
  closeSettings: () => void;
  handleTempThemeToggle: () => void;
  handleTempItemsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  applySettings: () => void;
}

export default function useThemeSettings(): UseThemeSettingsResult {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Initialize from localStorage if available
    return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
  });
  
  // Items per page state
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_DEFAULT);
  
  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Temporary states for settings modal
  const [tempItemsPerPage, setTempItemsPerPage] = useState(itemsPerPage);
  const [tempTheme, setTempTheme] = useState(theme);
  
  // Ref to prevent multiple state updates
  const isUpdatingSettings = useRef(false);

  // Apply theme effect without causing re-renders
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Initialize itemsPerPage from localStorage on mount
  useEffect(() => {
    const savedItemsPerPage = localStorage.getItem('itemsPerPage');
    if (savedItemsPerPage) {
      setItemsPerPage(parseInt(savedItemsPerPage));
    }
  }, []);

  // Update temp values when settings modal opens or underlying values change
  useEffect(() => {
    if (isSettingsOpen) {
      setTempItemsPerPage(itemsPerPage);
      setTempTheme(theme);
    }
  }, [isSettingsOpen, itemsPerPage, theme]);

  // Handlers for the temp values
  const handleTempItemsPerPageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setTempItemsPerPage(value);
    }
  }, []);
  
  const handleTempThemeToggle = useCallback(() => {
    setTempTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  }, []);
  
  // Apply settings
  const applySettings = useCallback(() => {
    // Apply items per page
    setItemsPerPage(tempItemsPerPage);
    localStorage.setItem('itemsPerPage', tempItemsPerPage.toString());
    
    // Apply theme
    setTheme(tempTheme);
    
    // Close modal
    setIsSettingsOpen(false);
  }, [tempItemsPerPage, tempTheme]);

  // Stable setters
  const openSettings = useCallback(() => {
    if (isUpdatingSettings.current) return;
    isUpdatingSettings.current = true;
    
    // Use setTimeout to add a small delay and prevent multiple state updates
    setTimeout(() => {
      setIsSettingsOpen(true);
      isUpdatingSettings.current = false;
    }, 100);
  }, []);
  
  const closeSettings = useCallback(() => {
    if (isUpdatingSettings.current) return;
    isUpdatingSettings.current = true;
    
    // Use setTimeout to add a small delay and prevent multiple state updates
    setTimeout(() => {
      setIsSettingsOpen(false);
      isUpdatingSettings.current = false;
    }, 100);
  }, []);

  return {
    theme,
    itemsPerPage,
    isSettingsOpen,
    tempTheme,
    tempItemsPerPage,
    openSettings,
    closeSettings,
    handleTempThemeToggle,
    handleTempItemsPerPageChange,
    applySettings
  };
} 