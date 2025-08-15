'use client';
import { QuickCvIcon } from './icons';
import Link from 'next/link';
import { Button } from './ui/button';
import { Home, Shield } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center max-w-screen-2xl mx-auto justify-between">
        <Link href="/" className="flex items-center gap-2">
          <QuickCvIcon className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl tracking-tight hidden sm:inline">Quick CV Maker</span>
        </Link>
        <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/">
                <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2"/>
                    Home
                </Button>
            </Link>
            <Link href="/admin/login">
                <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-2"/>
                    Admin
                </Button>
            </Link>
        </div>
      </div>
    </header>
  );
}
