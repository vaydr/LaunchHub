import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SearchParams } from "@shared/schema";
import type { Contact } from "@shared/schema";

// Components
import ContactTable from "@/components/contact-table";
import SearchFilters from "@/components/search-filters";
import PageHeader from "@/components/page-header";
import ContactsHeader from "@/components/contacts-header";
import ContactsContainer, { ContactsCard } from "@/components/contacts-container";
import ProfileModal from "@/components/profile-modal";
import SettingsModal from "@/components/settings-modal";

// Hooks
import usePagination from "@/hooks/use-pagination";
import useThemeSettings from "@/hooks/use-theme-settings";
import useProfileModal from "@/hooks/use-profile-modal";

// Utils
import { getSocialCreditColorRGB, getSocialCreditDescription } from "@/utils/social-credit-utils";

export default function Contacts() {
  // Search state
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "",
    departments: [],
    years: []
  });
  
  // Connection filter state
  const [activeConnectionFilter, setActiveConnectionFilter] = useState<number | null>(null);
  
  // Advanced search mode state
  const [isAdvancedSearchMode, setIsAdvancedSearchMode] = useState(false);

  // Get theme and settings from hook
  const {
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
  } = useThemeSettings();

  // Get profile modal state from hook
  const {
    isProfileOpen,
    openProfile,
    closeProfile,
    socialCreditScore
  } = useProfileModal();

  // Fetch contacts data
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['/api/contacts', searchParams, activeConnectionFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchParams.query) params.append('query', searchParams.query);
      if (searchParams.departments && searchParams.departments.length > 0) {
        searchParams.departments.forEach(dept => params.append('departments', dept));
      }
      if (searchParams.years && searchParams.years.length > 0) {
        searchParams.years.forEach(year => params.append('years', year.toString()));
      }
      
      // Add support for tags in the API call
      if ((searchParams as any).tags && (searchParams as any).tags.length > 0) {
        (searchParams as any).tags.forEach((tag: string) => params.append('tags', tag));
      }
      
      // Add connection filter to API call if active
      if (activeConnectionFilter) {
        params.append('connection', activeConnectionFilter.toString());
      }
      
      // Add semantic search flag if present
      if ((searchParams as any).semantic) {
        params.append('semantic', 'true');
      }
      
      return fetch(`/api/contacts?${params}`).then(res => res.json());
    }
  });

  // Use pagination hook
  const {
    paginatedContacts,
    totalPages,
    currentPage,
    setCurrentPage,
    totalEntries
  } = usePagination({
    contacts,
    itemsPerPage,
    activeConnectionFilter
  });

  // Handle search params changes including advanced search mode
  const handleSearchParamsChange = (params: Partial<any>) => {
    // Check if the search mode has changed
    if (params.semantic !== undefined && params.semantic !== isAdvancedSearchMode) {
      setIsAdvancedSearchMode(params.semantic);
    }
    
    setSearchParams(prevParams => ({ ...prevParams, ...params }));
  };

  return (
    <ContactsContainer>
      <PageHeader 
        onOpenProfile={openProfile}
        onOpenSettings={openSettings}
      />

      <ContactsCard>
        <ContactsHeader />
        
        <SearchFilters 
          onSearch={handleSearchParamsChange}
          connectionPerson={activeConnectionFilter ? contacts.find((c: Contact) => c.id === activeConnectionFilter) ?? null : null}
          onClearConnectionFilter={() => setActiveConnectionFilter(null)}
        />
        
        <ContactTable
          contacts={paginatedContacts}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalEntries={totalEntries}
          onPageChange={setCurrentPage}
          onFilterConnections={setActiveConnectionFilter}
          activeConnectionFilter={activeConnectionFilter}
        />
      </ContactsCard>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={closeProfile}
        socialCreditScore={socialCreditScore}
        getSocialCreditColorRGB={getSocialCreditColorRGB}
        getSocialCreditDescription={getSocialCreditDescription}
      />
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        tempItemsPerPage={tempItemsPerPage}
        tempTheme={tempTheme}
        onTempItemsPerPageChange={handleTempItemsPerPageChange}
        onTempThemeToggle={handleTempThemeToggle}
        onApplySettings={applySettings}
      />
    </ContactsContainer>
  );
}