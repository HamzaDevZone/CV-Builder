
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { SplashScreen } from '@/components/splash-screen';
import { WelcomeScreen } from '@/components/welcome-screen';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';
import { Footer } from '@/components/footer';
import { CvPreview } from '@/components/cv-preview';
import { defaultCvData } from '@/lib/schemas';
import { CvProvider, useCvContext } from '@/context/cv-context';
import { templateColors } from '@/context/cv-context';
import type { Template } from '@/lib/types';

function LandingPage() {
  const templatesToShow: Template[] = ['classic', 'modern', 'creative', 'professional'];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="text-center py-20 md:py-32 bg-secondary/50">
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-primary">
              Build Your Professional CV in Minutes
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from a variety of professionally designed templates, fill in your details, and download your perfect CV. It's that simple.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/templates">
                  Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#templates">
                  View Templates
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Template Preview Section */}
        <section id="templates" className="py-20 md:py-28">
            <div className="container">
                <h2 className="text-3xl md:text-4xl font-extrabold text-center tracking-tight">Designed for Impact</h2>
                <p className="mt-3 text-lg text-muted-foreground text-center max-w-2xl mx-auto">
                    From classic and elegant to modern and creative, find a template that matches your personality and profession.
                </p>
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {templatesToShow.map(templateId => (
                        <div key={templateId} className="border rounded-lg shadow-lg overflow-hidden group">
                           <div className="aspect-[210/297] w-full overflow-hidden">
                             <div className="transform scale-[0.3] origin-top-left w-[333.33%] h-[333.33%]">
                                <CvPreview
                                    data={defaultCvData}
                                    template={templateId}
                                    accentColor={templateColors[templateId]?.accent ?? '#1F3A93'}
                                    backgroundColor={templateColors[templateId]?.background ?? '#FFFFFF'}
                                    fontFamily="'Inter', sans-serif"
                                />
                             </div>
                           </div>
                           <div className="p-4 bg-background">
                            <h3 className="font-semibold capitalize text-lg">{templateId}</h3>
                           </div>
                        </div>
                    ))}
                </div>
                 <div className="text-center mt-12">
                    <Button asChild size="lg" variant="outline">
                        <Link href="/templates">
                           See All Templates <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28 bg-secondary/50">
            <div className="container">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                         <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Why Choose Quick CV Maker?</h2>
                         <p className="text-lg text-muted-foreground">
                            We provide the tools you need to create a CV that stands out and gets you noticed.
                         </p>
                         <ul className="space-y-4 text-muted-foreground">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1"/>
                                <span><span className="font-semibold text-foreground">AI-Powered Enhancement:</span> Get intelligent feedback to improve your CV content and structure.</span>
                            </li>
                             <li className="flex items-start gap-3">
                                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1"/>
                                <span><span className="font-semibold text-foreground">Instant Previews:</span> See your changes in real-time as you type. No more guesswork.</span>
                            </li>
                             <li className="flex items-start gap-3">
                                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1"/>
                                <span><span className="font-semibold text-foreground">Flexible Downloads:</span> Export your final CV as a PDF or high-quality image.</span>
                            </li>
                         </ul>
                    </div>
                    <div className="p-8 bg-background rounded-xl shadow-2xl">
                        <div className="flex items-center justify-center">
                           <Star className="h-8 w-8 text-yellow-400"/>
                           <Star className="h-10 w-10 text-yellow-400"/>
                           <Star className="h-8 w-8 text-yellow-400"/>
                        </div>
                        <blockquote className="text-center text-lg italic text-foreground mt-4">
                            "This is the best CV builder I've ever used. The AI feedback feature is a game-changer!"
                        </blockquote>
                        <p className="text-center font-semibold mt-2 text-muted-foreground">- A Happy Developer</p>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}


export default function HomePageWrapper() {
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
    }, 1500); // Shorter splash screen
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
      <LandingPage />
    </CvProvider>
  );
}
