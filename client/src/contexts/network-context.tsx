import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NetworkSettings {
  nodeSize: number;
  edgeThickness: number;
  showLabels: boolean;
  // Force graph specific settings
  chargeStrength: number;
  linkDistance: number;
  cooldownTime: number;
  nodeRelSize: number;
  colorScheme: 'default' | 'rainbow' | 'heat';
  maxNodeCount: number; // Limit number of nodes for performance
}

interface NetworkContextType {
  settings: NetworkSettings;
  updateSettings: (newSettings: Partial<NetworkSettings>) => void;
}

const defaultSettings: NetworkSettings = {
  nodeSize: 5,
  edgeThickness: 1,
  showLabels: true,
  // Default values for force graph settings - optimized for performance
  chargeStrength: -50,
  linkDistance: 40,
  cooldownTime: 1000, // Reduced for faster initial layout
  nodeRelSize: 4,
  colorScheme: 'default',
  maxNodeCount: 100, // Limit to 100 nodes by default for performance
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<NetworkSettings>(defaultSettings);

  const updateSettings = (newSettings: Partial<NetworkSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  return (
    <NetworkContext.Provider value={{ settings, updateSettings }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
} 