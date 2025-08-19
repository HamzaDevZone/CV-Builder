import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { AdDisplay } from '@/components/ad-display';
import { getAds } from '@/lib/actions';

export const metadata: Metadata = {
  title: 'Quick CV Maker',
  description: 'Build professional CVs and resumes with ease. Choose from free and premium templates.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ads = await getAds();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:ital,wght@0,400..700;1,400..700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <div className="flex flex-col min-h-screen">
              <AdDisplay initialAds={ads} />
              <div className="flex-grow">
                {children}
              </div>
            </div>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
