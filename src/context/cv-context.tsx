'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { type CvData } from '@/lib/types';
import { defaultCvData } from '@/lib/schemas';

type Template = 'classic' | 'modern';

interface CvContextType {
  cvData: CvData;
  setCvData: (data: CvData) => void;
  template: Template;
  setTemplate: (template: Template) => void;
  isPremiumUnlocked: boolean;
  unlockPremium: () => void;
}

const CvContext = createContext<CvContextType | undefined>(undefined);

export function CvProvider({ children }: { children: ReactNode }) {
  const [cvData, setCvData] = useState<CvData>(defaultCvData);
  const [template, setTemplate] = useState<Template>('classic');
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);

  const unlockPremium = () => setIsPremiumUnlocked(true);

  return (
    <CvContext.Provider value={{ cvData, setCvData, template, setTemplate, isPremiumUnlocked, unlockPremium }}>
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
