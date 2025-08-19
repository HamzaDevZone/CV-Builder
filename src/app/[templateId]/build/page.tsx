// This file follows the recommended Next.js App Router pattern.
// 1. The default export `BuilderPage` is a Server Component.
//    - It is responsible for server-side tasks like reading route parameters (`params`).
// 2. The `BuilderClientPage` is the Client Component (marked with 'use client').
//    - It handles all client-side logic, state, and hooks (useEffect, useRouter, etc.).
//    - The Server Component renders this Client Component, passing the `templateId`.

import { CvProvider, useCvContext } from '@/context/cv-context';
import { type Template } from '@/lib/types';
import { Header } from '@/components/header';
import { CvForm } from '@/components/cv-form';
import { CvPreviewPanel } from '@/components/cv-preview-panel';
import 'client-only';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';


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
function BuilderClientPage() {
    'use client';
    return (
        <CvProvider>
            <BuilderClientContent />
        </CvProvider>
    )
}

// This is the main page component, which is a Server Component
export default function BuilderPage() {
  return <BuilderClientPage />;
}
