'use client';

import { useState, useEffect } from 'react';
import { CvForm } from '@/components/cv-form';
import { CvPreviewPanel } from '@/components/cv-preview-panel';
import { Header } from '@/components/header';
import { CvProvider } from '@/context/cv-context';
import { SplashScreen } from '@/components/splash-screen';
import { WelcomeScreen } from '@/components/welcome-screen';

export default function BuilderPage() {
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
        <main className="flex-1 w-full max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] xl:grid-cols-[1fr_0.6fr]">
            <div className="rounded-lg">
              <CvForm />
            </div>
            <div className="lg:sticky top-8 self-start">
              <CvPreviewPanel />
            </div>
          </div>
        </main>
      </div>
    </CvProvider>
  );
}
