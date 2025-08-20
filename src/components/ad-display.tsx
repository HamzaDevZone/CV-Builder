
'use client';

import { useState, useEffect } from 'react';
import type { Ad } from '@/lib/types';
import Image from 'next/image';
import { Megaphone, X, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

const AD_ROTATION_INTERVAL = 1000 * 60 * 20; // 20 minutes

export function AdDisplay({ initialAds }: { initialAds: Ad[] }) {
  const [ads, setAds] = useState(initialAds);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, AD_ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [ads.length]);
  
  // Periodically re-fetch ads to get new ones without a page reload
  useEffect(() => {
      const fetchAds = async () => {
          try {
              // This is a simplified way to re-fetch.
              // In a real app, you might use a more robust data-fetching library that handles this.
              const response = await fetch('/api/ads'); // This API route doesn't exist, so we will mock the behavior
               if (initialAds.length !== ads.length) {
                   setAds(initialAds);
               }
          } catch (error) {
              console.error("Failed to re-fetch ads", error)
          }
      };
      const refetchInterval = setInterval(fetchAds, 1000 * 60 * 5); // check for new ads every 5 mins
      return () => clearInterval(refetchInterval);
  }, [initialAds, ads.length])

  if (!isVisible || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  return (
    <AnimatePresence>
     {isVisible && currentAd && (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="bg-primary/10 text-primary"
        >
          <div className="container mx-auto px-4">
            <a href={currentAd.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 group py-2">
                <div className="flex items-center gap-4">
                    <Image
                        src={currentAd.imageUrl}
                        alt={currentAd.brandName || ''}
                        width={120}
                        height={40}
                        className="rounded-md object-cover hidden sm:block"
                        data-ai-hint="advertisement banner"
                    />
                    <Megaphone className="h-6 w-6 flex-shrink-0 sm:hidden" />
                    <div className="text-sm">
                        <p className="font-bold">{currentAd.brandName} <span className="ml-2 inline-flex items-center gap-1 text-xs opacity-70 group-hover:opacity-100 transition-opacity">Visit Store <ArrowRight className="h-3 w-3"/></span></p>
                        <p className="text-primary/80 hidden md:block">{currentAd.offer}</p>
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsVisible(false);
                    }}
                    className="p-1 rounded-full hover:bg-primary/20 transition-colors"
                    aria-label="Close ad"
                >
                    <X className="h-4 w-4" />
                </button>
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
