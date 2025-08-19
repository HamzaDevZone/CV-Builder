'use client';
import { QuickCvIcon } from './icons';
import Link from 'next/link';
import { Button } from './ui/button';
import { Home, LayoutTemplate, Settings } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center max-w-screen-2xl mx-auto justify-between">
        <Link href="/" className="flex items-center gap-2">
          <QuickCvIcon className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl tracking-tight hidden sm:inline">Quick CV Maker</span>
        </Link>
        <div className="flex items-center gap-2">
            <Link href="/">
                <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2"/>
                    Home
                </Button>
            </Link>
            <Link href="/templates">
                <Button variant="ghost" size="sm">
                    <LayoutTemplate className="h-4 w-4 mr-2"/>
                    Templates
                </Button>
            </Link>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className='h-9 w-9'>
                  <Settings className="h-4 w-4" />
                   <span className="sr-only">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                   <Link href="/admin/login">
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
                <div className="flex items-center justify-between px-2 py-1.5 text-sm">
                  <span>Theme</span>
                  <ThemeToggle />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
