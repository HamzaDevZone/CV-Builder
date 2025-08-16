
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { type CvData, type Template } from '@/lib/types';
import { defaultCvData } from '@/lib/schemas';
import { getPremiumStatus } from '@/lib/actions';

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
  paper: '#f3f4f6',
  dark: '#1f2937',
  gradient: 'linear-gradient(to right, #6d28d9, #be185d)',
};

export const fonts = {
    inter: { name: 'Inter', cssValue: "'Inter', sans-serif" },
    jakarta: { name: 'Plus Jakarta Sans', cssValue: "'Plus Jakarta Sans', sans-serif" },
    roboto: { name: 'Roboto', cssValue: "'Roboto', sans-serif" },
    lora: { name: 'Lora', cssValue: "'Lora', serif" },
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
  fontFamily: string;
  setFontFamily: (font: string) => void;
  isPremiumUnlocked: (templateId: Template) => boolean;
  pendingTemplate: { id: Template, until: number } | null;
  refreshStatus: () => void;
}

const CvContext = createContext<CvContextType | undefined>(undefined);

// Define all templates outside the component
const allTemplates = [
    { id: 'classic', type: 'free'}, { id: 'modern', type: 'premium'},
    { id: 'creative', type: 'premium'}, { id: 'professional', type: 'premium'},
    { id: 'minimalist', type: 'premium'}, { id: 'executive', type: 'premium'},
    { id: 'elegant', type: 'premium'}, { id: 'bold', type: 'premium'},
    { id: 'academic', type: 'premium'}, { id: 'tech', type: 'premium'},
    { id: 'designer', type: 'premium'}, { id: 'corporate', type: 'premium'},
    { id: 'artistic', type: 'premium'}, { id: 'sleek', type: 'premium'},
    { id: 'vintage', type: 'premium'}, { id: 'premium-plus', type: 'premium'},
    { id: 'platinum', type: 'premium'}, { id: 'luxe', type: 'premium'},
    { id: 'visionary', type: 'premium'}, { id: 'prestige', type: 'premium'},
    { id: 'avant-garde', type: 'premium'}
];

export function CvProvider({ children }: { children: ReactNode }) {
  const [cvData, setCvData] = useState<CvData>(defaultCvData);
  const [template, setTemplate] = useState<Template>('classic');
  const [accentColor, setAccentColor] = useState<string>(accentColors[0]);
  const [backgroundColor, setBackgroundColor] = useState<string>(backgroundColors.light);
  const [fontFamily, setFontFamily] = useState<string>(fonts.inter.cssValue);
  
  const [premiumStatus, setPremiumStatus] = useState<Record<Template, boolean>>({} as Record<Template, boolean>);
  const [pendingTemplate, setPendingTemplate] = useState<{ id: Template, until: number } | null>(null);

  const checkAllPremiumStatuses = useCallback(async () => {
    const username = localStorage.getItem('cv-username');
    if (!username) {
        setPremiumStatus({} as Record<Template, boolean>);
        setPendingTemplate(null);
        return;
    }

    let hasPending = false;
    const newStatus: Record<Template, boolean> = {} as any;

    for (const t of allTemplates) {
        if (t.type === 'premium') {
            try {
                const { isUnlocked, pendingUntil } = await getPremiumStatus({ username, templateId: t.id });
                newStatus[t.id] = isUnlocked;

                if (pendingUntil && pendingUntil > Date.now()) {
                    setPendingTemplate({ id: t.id, until: pendingUntil });
                    hasPending = true;
                }
            } catch (error) {
                console.error(`Failed to check premium status for ${t.id}:`, error);
                newStatus[t.id] = false;
            }
        }
    }

    setPremiumStatus(newStatus);
    if (!hasPending) {
        setPendingTemplate(null);
    }
  }, []);
    
  useEffect(() => {
    checkAllPremiumStatuses();
    const interval = setInterval(checkAllPremiumStatuses, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [checkAllPremiumStatuses]);

  const refreshStatus = () => {
      checkAllPremiumStatuses();
  }

  const isPremiumUnlocked = (templateId: Template): boolean => {
      const t = allTemplates.find(t => t.id === templateId);
      if (!t || t.type === 'free') return true;
      return premiumStatus[templateId] || false;
  }

  return (
    <CvContext.Provider value={{ cvData, setCvData, template, setTemplate, accentColor, setAccentColor, backgroundColor, setBackgroundColor, fontFamily, setFontFamily, isPremiumUnlocked, pendingTemplate, refreshStatus }}>
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
