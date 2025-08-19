

'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { CvProvider } from '@/context/cv-context';
import { SplashScreen } from '@/components/splash-screen';
import { WelcomeScreen } from '@/components/welcome-screen';
import { TemplateSelection } from '@/components/template-selection';

export default function HomePage() {
  const [appState, setAppState] = useState('loading'); // loading, welcome, ready
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('cv-username');
    const timer = setTimeout(() => {
      if (storedUsername) {
        setUsername(storedUsername);
        setAppState('ready');
      } else {
        setAppState('welcome');
      }
    }, 2000); // Show splash screen for 2 seconds
    return () => clearTimeout(timer);
  }, []);
  
  const handleGetStarted = (name: string) => {
    localStorage.setItem('cv-username', name);
    setUsername(name);
    setAppState('ready');
  }

  if (appState === 'loading') {
    return <SplashScreen />;
  }
  
  if (appState === 'welcome') {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }

  return (
    <CvProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1">
         <div className="w-full max-w-screen-xl mx-auto p-4 md:p-6 lg:p-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Choose Your Template</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Select a professionally designed template below to get started. You can preview any template with your information before making a decision.</p>
            </div>
            <TemplateSelection />
          </div>
        </main>
      </div>
    </CvProvider>
  );
}
