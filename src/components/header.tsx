'use client';
import { CVPakIcon } from './icons';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur">
      <div className="container flex h-16 items-center max-w-[100rem] mx-auto">
        <div className="mr-4 flex items-center">
          <CVPakIcon className="h-8 w-8 mr-2 text-primary" />
          <span className="font-bold text-xl tracking-tight">CVPak Builder</span>
        </div>
      </div>
    </header>
  );
}
