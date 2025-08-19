
'use client';

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { type CvData, type Template } from '@/lib/types';
import { defaultCvData } from '@/lib/schemas';
import { getPremiumStatus } from '@/lib/actions';

export const accentColors = [
  '#1F3A93', // Navy Blue (from palette)
  '#708090', // Slate Gray (from palette)
  '#2E2E2E', // Charcoal Gray (from palette)
  '#FFD700', // Gold (from palette)
  '#013220', // Emerald Green (from palette)
  '#C0C0C0', // Silver (from palette)
  '#db2777', // Pink
];

// Default colors for when a template doesn't have a specific theme
const defaultBackgroundColor = '#FFFFFF';
const defaultAccentColor = '#1F3A93';

// Pre-defined color schemes for each template
export const templateColors: Partial<Record<Template, { background: string; accent: string }>> = {
    'classic': { background: '#FFFFFF', accent: '#1F3A93' },
    'modern': { background: '#FFFFF0', accent: '#708090' },
    'creative': { background: '#E6F0FA', accent: '#2E2E2E' },
    'professional': { background: '#F8F8FF', accent: '#FFD700' },
    'minimalist': { background: '#F8F8FF', accent: '#1F3A93'},
    'executive': { background: '#F5F5F5', accent: '#013220'},
    'elegant': { background: '#FDEDED', accent: '#C0C0C0' },
    'bold': { background: '#F5F5F5', accent: '#1A1A1A' },
    'tech': { background: '#F5F5F5', accent: '#013220' },
    'corporate': { background: '#F8F8FF', accent: '#1F3A93' },
    'artistic': { background: '#FDEDED', accent: '#2C003E' },
    'premium-plus': { background: '#F5F5F5', accent: '#1A1A1A' },
    'luxe': { background: '#F8F8FF', accent: '#FFD700' },
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
  const [template, _setTemplate] = useState<Template>('classic');
  const [accentColor, setAccentColor] = useState<string>(defaultAccentColor);
  const [backgroundColor, setBackgroundColor] = useState<string>(defaultBackgroundColor);
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

    const premiumTemplates = allTemplates.filter(t => t.type === 'premium');
    
    // Using Promise.all to fetch statuses concurrently for better performance
    const statuses = await Promise.all(premiumTemplates.map(t => 
        getPremiumStatus({ username, templateId: t.id })
            .catch(error => {
                console.error(`Failed to check premium status for ${t.id}:`, error);
                return { isUnlocked: false, pendingUntil: undefined }; // Return a default object on error
            })
    ));

    premiumTemplates.forEach((t, index) => {
        const { isUnlocked, pendingUntil } = statuses[index];
        newStatus[t.id] = isUnlocked;

        if (pendingUntil && pendingUntil > Date.now()) {
            setPendingTemplate({ id: t.id, until: pendingUntil });
            hasPending = true;
        }
    });

    setPremiumStatus(newStatus);
    if (!hasPending) {
        setPendingTemplate(null);
    }
  }, []);
    
  useEffect(() => {
    checkAllPremiumStatuses();
    const interval = setInterval(checkAllPremiumStatuses, 10000); // Check every 10 seconds to reduce load
    
    return () => clearInterval(interval);
  }, [checkAllPremiumStatuses]);

  const refreshStatus = useCallback(() => {
      checkAllPremiumStatuses();
  }, [checkAllPremiumStatuses]);

  const isPremiumUnlocked = useCallback((templateId: Template): boolean => {
      const t = allTemplates.find(t => t.id === templateId);
      if (!t || t.type === 'free') return true;
      return premiumStatus[templateId] || false;
  }, [premiumStatus]);

  const setTemplate = (newTemplate: Template) => {
    _setTemplate(newTemplate);
    const theme = templateColors[newTemplate];
    if (theme) {
        setBackgroundColor(theme.background);
        setAccentColor(theme.accent);
    } else {
        // Revert to defaults if the new template has no theme
        setBackgroundColor(defaultBackgroundColor);
        setAccentColor(defaultAccentColor);
    }
  }

  // On initial load, set the colors for the default template
  useEffect(() => {
    setTemplate('classic');
  }, []);


  const value = { 
        cvData, 
        setCvData, 
        template, 
        setTemplate, 
        accentColor, 
        setAccentColor, 
        backgroundColor, 
        setBackgroundColor, 
        fontFamily, 
        setFontFamily, 
        isPremiumUnlocked, 
        pendingTemplate, 
        refreshStatus 
    };

  return (
    <CvContext.Provider value={value}>
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
