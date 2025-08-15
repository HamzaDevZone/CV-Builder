'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type CvData } from '@/lib/types';
import { defaultCvData } from '@/lib/schemas';
import { getPremiumStatus } from '@/lib/actions';

type Template = 'classic' | 'modern';

export const accentColors = [
  '#2563eb', // Default Blue
  '#16a34a', // Green
  '#ca8a04', // Amber
  '#dc2626', // Red
  '#8b5cf6', // Violet
  '#db2777', // Pink
  '#475569', // Slate
];

export const backgroundColors = {
  light: '#ffffff',
  dark: '#111827',
  paper: '#f3f4f6',
};

interface CvContextType {
  cvData: CvData;
  setCvData: (data: CvData) => void;
  template: Template;
  setTemplate: (template: Template) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  isPremiumUnlocked: boolean;
  unlockPremium: () => void;
}

const CvContext = createContext<CvContextType | undefined>(undefined);

export function CvProvider({ children }: { children: ReactNode }) {
  const [cvData, setCvData] = useState<CvData>(defaultCvData);
  const [template, setTemplate] = useState<Template>('classic');
  const [accentColor, setAccentColor] = useState<string>(accentColors[0]);
  const [backgroundColor, setBackgroundColor] = useState<string>(backgroundColors.light);
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);
  
  // Mock user ID
  const userId = 'user-123';

  useEffect(() => {
    const checkPremium = async () => {
      try {
        const status = await getPremiumStatus(userId);
        setIsPremiumUnlocked(status);
      } catch (error) {
        console.error("Failed to check premium status:", error);
      }
    };
    checkPremium();
    
    // Periodically check for status changes
    const interval = setInterval(checkPremium, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [userId]);


  const unlockPremium = () => setIsPremiumUnlocked(true);

  return (
    <CvContext.Provider value={{ cvData, setCvData, template, setTemplate, accentColor, setAccentColor, backgroundColor, setBackgroundColor, isPremiumUnlocked, unlockPremium }}>
      {children}
    </CvContext.Provider>
  );
}

export function useCvContext() {
  const context = useContext(CvContext);
  if (context === undefined) {
    throw new Error('useCvContext must be used within a CvProvider');
  }
  return context;
}
