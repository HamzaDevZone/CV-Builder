
'use client';

import { useState, useRef } from 'react';
import { useCvContext } from '@/context/cv-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Sparkles, FileText, Palette, Check, Paintbrush, Image as ImageIcon, Type, Share2, FileType } from 'lucide-react';
import { CvPreview } from './cv-preview';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { enhanceCv } from '@/lib/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { serializeCvData } from '@/lib/utils';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import * as htmlToImage from 'html-to-image';
import { accentColors, fonts, templateColors } from '@/context/cv-context';


export function CvPreviewPanel() {
  const { cvData, template, isPremiumUnlocked, accentColor, setAccentColor, fontFamily, setFontFamily } = useCvContext();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  
  const { backgroundColor, setBackgroundColor } = useCvContext();

  const isCurrentTemplatePremium = template !== 'classic';
  const isCurrentTemplateUnlocked = !isCurrentTemplatePremium || isPremiumUnlocked(template);
  
  const handleUnlockAndDownload = (downloadFn: () => void) => {
     if (isCurrentTemplatePremium && !isCurrentTemplateUnlocked) {
      toast({
        title: 'Premium Template Locked',
        description: 'Please go to the main page to purchase this template before downloading.',
        variant: 'destructive',
      });
      return;
    }
    downloadFn();
  }

  const handleDownloadPdf = async () => {
    const node = printRef.current;
    if (!node) {
      toast({ title: 'Error', description: 'Could not find CV to download.', variant: 'destructive'});
      return;
    };
    
    setIsDownloading(true);
    
    // Temporarily remove the watermark for printing if the template is unlocked
    const watermark = node.querySelector('.premium-watermark') as HTMLElement | null;
    if (isCurrentTemplateUnlocked && watermark) {
      watermark.style.display = 'none';
    }

    try {
      // Use html-to-image to get a PNG data URL
      const dataUrl = await htmlToImage.toPng(node, {
          quality: 1.0,
          pixelRatio: 2,
      });

      // Create a temporary link to trigger the download
      const link = document.createElement('a');
      link.download = `${cvData.personalDetails.name.replace(/ /g, '_')}_CV.pdf`;
      
      // We will create a simple PDF that contains the image.
      // For more complex PDFs, a library like jsPDF would be needed.
      // But for a single-page CV, this is a robust way to get a high-quality print.
      const pdfIframe = document.createElement('iframe');
      pdfIframe.style.visibility = 'hidden';
      document.body.appendChild(pdfIframe);
      const pdfDoc = pdfIframe.contentWindow?.document;
      
      if (pdfDoc) {
        pdfDoc.open();
        pdfDoc.write(`
          <html>
            <head>
              <title>${cvData.personalDetails.name} CV</title>
              <style>
                @page { size: A4; margin: 0; }
                body { margin: 0; }
                img { width: 100%; display: block; }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" />
            </body>
          </html>
        `);
        pdfDoc.close();
        pdfIframe.contentWindow?.focus();
        pdfIframe.contentWindow?.print();
      }

      document.body.removeChild(pdfIframe);


    } catch (error) {
        console.error('Oops, something went wrong!', error);
        toast({ title: 'Download Failed', description: 'Could not generate PDF. Please try again.', variant: 'destructive'})
    } finally {
        setIsDownloading(false);
        // Restore watermark after printing
        if (isCurrentTemplateUnlocked && watermark) {
            watermark.style.display = 'flex';
        }
    }
  };
  
  const handleDownloadImage = async (format: 'png' | 'jpeg') => {
    const node = printRef.current;
    if (!node) {
        toast({ title: 'Error', description: 'Could not find CV to download.', variant: 'destructive'});
        return;
    };
   
    // Temporarily remove the watermark for image generation if the template is unlocked
    const watermark = node.querySelector('.premium-watermark') as HTMLElement | null;
    if (isCurrentTemplateUnlocked && watermark) {
      watermark.style.display = 'none';
    }

    setIsDownloading(true);
    try {
        const toFn = format === 'png' ? htmlToImage.toPng : htmlToImage.toJpeg;
        const dataUrl = await toFn(node, {
            quality: 1.0,
            pixelRatio: 2, 
        });
        const link = document.createElement('a');
        link.download = `${cvData.personalDetails.name.replace(/ /g, '_')}_CV.${format}`;
        link.href = dataUrl;
        link.click();
        link.remove();
    } catch (error) {
        console.error('oops, something went wrong!', error);
        toast({ title: 'Download Failed', description: 'Could not generate image. Please try again.', variant: 'destructive'})
    } finally {
        setIsDownloading(false);
         // Restore watermark after generation
        if (isCurrentTemplateUnlocked && watermark) {
            watermark.style.display = 'flex';
        }
    }
  }

  const handleAiEnhance = async () => {
    setIsAiLoading(true);
    setAiFeedback('');
    try {
      const cvContent = serializeCvData(cvData);
      const feedback = await enhanceCv({ cvContent });
      setAiFeedback(feedback);
      setIsFeedbackDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleShare = () => {
    const subject = `CV from ${cvData.personalDetails.name || 'a candidate'}`;
    const body = `${shareMessage}\n\nTo view the CV, please download the attached PDF.\n\n(Note: This is a sample app. In a real app, you would attach the PDF or provide a secure link.)`;
    const mailtoLink = `mailto:${shareEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    setIsShareDialogOpen(false);
  }

  return (
    <>
      <Card className="overflow-hidden shadow-lg border-none" id="tools">
        <CardHeader className="bg-muted/30 p-4 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CV Tools
          </CardTitle>
          <CardDescription>Use these tools to perfect and share your CV.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="font-semibold flex items-center gap-2"><Paintbrush className="h-4 w-4"/>Background Color</Label>
              <Input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="p-1 h-10 w-full"
                disabled={!!templateColors[template]}
              />
            </div>
            <div className="space-y-3">
              <Label className="font-semibold flex items-center gap-2"><Palette className="h-4 w-4"/>Accent Color</Label>
              <div className="flex flex-wrap gap-3">
                {accentColors.map((color) => (
                   <button
                      key={color}
                      type="button"
                      className={cn(
                        'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                        color === accentColor ? 'border-primary' : 'border-transparent',
                        templateColors[template] ? 'cursor-not-allowed opacity-50' : ''
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setAccentColor(color)}
                      aria-label={`Set color to ${color}`}
                      disabled={!!templateColors[template]}
                   >
                      {color === accentColor && <Check className="h-5 w-5 text-white mx-auto" />}
                   </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3">
              <Label className="font-semibold flex items-center gap-2"><Type className="h-4 w-4"/>Font Family</Label>
               <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(fonts).map(([id, font]) => (
                      <SelectItem key={id} value={font.cssValue} style={{fontFamily: font.cssValue}}>
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
         
          <Separator/>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleAiEnhance} disabled={isAiLoading} className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              {isAiLoading ? 'Analyzing...' : 'Enhance with AI'}
            </Button>
            <Button onClick={() => setIsShareDialogOpen(true)} variant="outline" className="w-full">
              <Share2 className="mr-2 h-4 w-4" />
              Share via Email
            </Button>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full" disabled={isDownloading}>
                  {isDownloading ? (
                    'Downloading...'
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download CV
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => handleUnlockAndDownload(handleDownloadPdf)}>
                  <FileType className="mr-2 h-4 w-4" />
                  <span>Download as PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUnlockAndDownload(() => handleDownloadImage('png'))}>
                   <ImageIcon className="mr-2 h-4 w-4" />
                  <span>Download as PNG</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUnlockAndDownload(() => handleDownloadImage('jpeg'))}>
                   <ImageIcon className="mr-2 h-4 w-4" />
                  <span>Download as JPEG</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      
      {/* This wrapper is only for printing, and now for image generation */}
      <div className="print:block cv-print-wrapper" aria-hidden="true">
        <div ref={printRef} className="cv-print-area">
          <CvPreview
            data={cvData}
            template={template}
            accentColor={accentColor}
            backgroundColor={backgroundColor}
            fontFamily={fontFamily}
            isPremiumLocked={!isCurrentTemplateUnlocked}
          />
        </div>
      </div>
      
       {/* This is the on-screen preview */}
      <div className="mt-8 rounded-lg overflow-hidden shadow-2xl shadow-primary/10 print:hidden">
        <div className="aspect-[210/297] w-full">
           <CvPreview
            data={cvData}
            template={template}
            accentColor={accentColor}
            backgroundColor={backgroundColor}
            fontFamily={fontFamily}
            isPremiumLocked={!isCurrentTemplateUnlocked}
          />
        </div>
      </div>
      
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/>AI Feedback</DialogTitle>
            <DialogDescription>
              Here are some suggestions to improve your CV.
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-h-[60vh] overflow-y-auto p-1 rounded-lg dark:prose-invert">
            <pre className="whitespace-pre-wrap font-body text-sm text-foreground bg-secondary p-4 rounded-md">{aiFeedback}</pre>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsFeedbackDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
       <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share via Email</DialogTitle>
            <DialogDescription>
              Enter the recipient's email and a message. This will open your default email client.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className='space-y-2'>
              <Label htmlFor="shareEmail">Recipient's Email</Label>
              <Input id="shareEmail" type="email" placeholder="recipient@example.com" value={shareEmail} onChange={e => setShareEmail(e.target.value)} />
            </div>
            <div className='space-y-2'>
              <Label htmlFor="shareMessage">Optional Message</Label>
              <Textarea id="shareMessage" placeholder="I'd like to share my CV with you..." value={shareMessage} onChange={e => setShareMessage(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">
              Note: For this to work, you must first download the CV as a PDF and attach it to the email yourself.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleShare}>Compose Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
