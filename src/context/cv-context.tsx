
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
  isPremiumUnlocked: boolean;
  pendingTemplate: { id: Template, until: number } | null;
  refreshStatus: () => void;
}

const CvContext = createContext<CvContextType | undefined>(undefined);

export function CvProvider({ children }: { children: ReactNode }) {
  const [cvData, setCvData] = useState<CvData>(defaultCvData);
  const [template, setTemplate] = useState<Template>('classic');
  const [accentColor, setAccentColor] = useState<string>(accentColors[0]);
  const [backgroundColor, setBackgroundColor] = useState<string>(backgroundColors.light);
  const [fontFamily, setFontFamily] = useState<string>(fonts.inter.cssValue);
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<{ id: Template, until: number } | null>(null);

  
  const checkPremium = useCallback(async () => {
      const username = localStorage.getItem('cv-username');
      const selectedTemplate = allTemplates.find(t => t.id === template);
      if (!selectedTemplate || !username || selectedTemplate.type === 'free') {
        setIsPremiumUnlocked(false);
        setPendingTemplate(null);
        return;
      };
      
      try {
        const { isUnlocked, pendingUntil } = await getPremiumStatus({ username, templateId: template });
        setIsPremiumUnlocked(isUnlocked);

        if (pendingUntil && pendingUntil > Date.now()) {
          setPendingTemplate({ id: template, until: pendingUntil });
        } else {
          setPendingTemplate(null);
        }

      } catch (error) {
        console.error("Failed to check premium status:", error);
        setIsPremiumUnlocked(false);
        setPendingTemplate(null);
      }
    }, [template]); // Dependency on template is key
    
  useEffect(() => {
    checkPremium();
    // Periodically check for status changes, especially around template changes
    const interval = setInterval(checkPremium, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [template, checkPremium]);

  const refreshStatus = () => {
      checkPremium();
  }

  // Need to find all templates to check status on
  const allTemplates = [
      { id: 'classic', type: 'free'},
      { id: 'modern', type: 'premium'},
      { id: 'creative', type: 'premium'},
      { id: 'professional', type: 'premium'},
      { id: 'minimalist', type: 'premium'},
      { id: 'executive', type: 'premium'},
      { id: 'elegant', type: 'premium'},
      { id: 'bold', type: 'premium'},
      { id: 'academic', type: 'premium'},
      { id: 'tech', type: 'premium'},
      { id: 'designer', type: 'premium'},
      { id: 'corporate', type: 'premium'},
      { id: 'artistic', type: 'premium'},
      { id: 'sleek', type: 'premium'},
      { id: 'vintage', type: 'premium'},
      { id: 'premium-plus', type: 'premium'},
      { id: 'platinum', type: 'premium'},
      { id: 'luxe', type: 'premium'},
      { id: 'visionary', type: 'premium'},
      { id: 'prestige', type: 'premium'},
      { id: 'avant-garde', type: 'premium'}
  ]

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
