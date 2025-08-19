
'use client';

import { CvForm } from '@/components/cv-form';
import { CvPreviewPanel } from '@/components/cv-preview-panel';
import { Header } from '@/components/header';
import { CvProvider } from '@/context/cv-context';
import { type Template } from '@/lib/types';
import { useEffect } from 'react';
import { useCvContext } from '@/context/cv-context';
import { useRouter } from 'next/navigation';

interface BuilderPageProps {
  params: {
    templateId: Template;
  }
}

function BuildContent({ templateId }: { templateId: Template }) {
    const { setTemplate, isPremiumUnlocked } = useCvContext();
    const router = useRouter();

    useEffect(() => {
        const isUnlocked = templateId === 'classic' || isPremiumUnlocked(templateId);
        if (!isUnlocked) {
            // Maybe show a toast? For now, redirect to home.
            // This prevents direct URL access to a locked template's build page.
            router.push('/');
            return;
        }
        setTemplate(templateId);
    }, [templateId, setTemplate, isPremiumUnlocked, router]);

    return (
        <div className="flex flex-col h-screen bg-background">
            <Header />
            <main className="flex-1 overflow-y-auto">
                <div className="w-full max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.7fr] xl:grid-cols-[1fr_0.5fr] 2xl:grid-cols-[1fr_0.6fr] gap-8">
                        <div className="rounded-lg">
                            <CvForm />
                        </div>
                        <div className="lg:sticky lg:top-8 self-start">
                            <CvPreviewPanel />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}


export default function BuilderPage({ params }: BuilderPageProps) {
  
  return (
    <CvProvider>
        <BuildContent templateId={params.templateId} />
    </CvProvider>
  );
}
