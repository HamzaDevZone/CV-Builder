'use client';
import { CVPakIcon } from './icons';
import Link from 'next/link';
import { Button } from './ui/button';
import { Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center max-w-screen-2xl mx-auto justify-between">
        <Link href="/" className="flex items-center">
          <CVPakIcon className="h-8 w-8 mr-2 text-primary" />
          <span className="font-bold text-xl tracking-tight">CVPak Builder</span>
        </Link>
        <Link href="/admin/login">
            <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2"/>
                Admin Login
            </Button>
        </Link>
      </div>
    </header>
  );
}
