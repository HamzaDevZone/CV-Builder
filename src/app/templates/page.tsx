

'use client';

import { Header } from '@/components/header';
import { CvProvider } from '@/context/cv-context';
import { TemplateSelection } from '@/components/template-selection';
import { Footer } from '@/components/footer';

export default function TemplatesPage() {
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
        <Footer />
      </div>
    </CvProvider>
  );
}
