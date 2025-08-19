'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CvProvider, useCvContext } from '@/context/cv-context';
import type { Template } from '@/lib/types';
import { Header } from '@/components/header';
import { CvForm } from '@/components/cv-form';
import { CvPreviewPanel } from '@/components/cv-preview-panel';


function BuilderClientContent() {
    const params = useParams();
    const router = useRouter();
    const { setTemplate, isPremiumUnlocked } = useCvContext();
    const templateId = params.templateId as Template;

    useEffect(() => {
        // templateId might be undefined on initial render, so we guard against that.
        if (!templateId) return;

        const isUnlocked = templateId === 'classic' || isPremiumUnlocked(templateId);
        if (!isUnlocked) {
            router.push('/templates');
            return;
        }
        setTemplate(templateId);
    }, [templateId, setTemplate, isPremiumUnlocked, router]);

    if (!templateId) {
        // You can render a loading state while waiting for params
        return (
             <div className="flex flex-col h-screen bg-secondary/30">
                <Header />
                <main className="flex-1 overflow-y-auto flex items-center justify-center">
                    <p>Loading...</p>
                </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-secondary/30">
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

// This is the Client Component Wrapper. It provides the context and renders the content.
export function BuilderClientPage() {
    return (
        <CvProvider>
            <BuilderClientContent />
        </CvProvider>
    )
}
