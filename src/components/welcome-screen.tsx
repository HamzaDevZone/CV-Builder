'use client';

import { useState } from 'react';
import { QuickCvIcon } from './icons';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';

interface WelcomeScreenProps {
  onGetStarted: (username: string) => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onGetStarted(username.trim());
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-md shadow-2xl animate-fade-in">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <div className="mx-auto w-fit mb-4 p-3 bg-primary/10 rounded-full">
              <QuickCvIcon className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Quick CV Maker</CardTitle>
            <CardDescription>
              Please choose a username to get started. This will be used to identify your purchases.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., john_doe"
                required
                autoFocus
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={!username.trim()}>
              Get Started
            </Button>
          </CardFooter>
        </form>
      </Card>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
