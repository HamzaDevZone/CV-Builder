'use client';

import { QuickCvIcon } from './icons';
import { cn } from '@/lib/utils';

export function SplashScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-primary">
      <div className="flex flex-col items-center gap-4 animate-fade-in-out">
        <QuickCvIcon className="h-24 w-24" />
        <h1 className="text-3xl font-bold tracking-tight">Quick CV Maker</h1>
      </div>
      <style jsx>{`
        @keyframes fade-in-out {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.95);
          }
        }
        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
