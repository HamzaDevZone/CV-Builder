'use client';

import { CvForm } from '@/components/cv-form';
import { CvPreviewPanel } from '@/components/cv-preview-panel';
import { Header } from '@/components/header';
import { CvProvider } from '@/context/cv-context';

export default function BuilderPage() {
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
