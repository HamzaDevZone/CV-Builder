

'use client';

import { useState, useRef, useEffect } from 'react';
import { useCvContext, accentColors, backgroundColors, fonts } from '@/context/cv-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Sparkles, Lock, FileText, Palette, CheckCircle, Check, Paintbrush, Image as ImageIcon, Type, Share2, CreditCard, Upload, ChevronDown, FileType, Clock } from 'lucide-react';
import { CvPreview } from './cv-preview';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { enhanceCv, submitPayment } from '@/lib/actions';
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
import type { Template } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { QuickCvIcon } from './icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import * as htmlToImage from 'html-to-image';


type TemplateTier = {
    title: string;
    description: string;
    price?: number;
    usdPrice?: number;
    templates: { id: Template; name: string; type: 'free' | 'premium'}[];
};

const templateTiers: TemplateTier[] = [
    {
        title: 'Free',
        description: 'Get started with our classic, professional template.',
        templates: [
            { id: 'classic', name: 'Classic', type: 'free' },
        ]
    },
    {
        title: 'Standard',
        description: 'Well-balanced templates for a variety of roles.',
        price: 400,
        usdPrice: 1.5,
        templates: [
            { id: 'modern', name: 'Modern', type: 'premium' },
            { id: 'creative', name: 'Creative', type: 'premium' },
            { id: 'professional', name: 'Professional', type: 'premium' },
            { id: 'minimalist', name: 'Minimalist', type: 'premium' },
            { id: 'executive', name: 'Executive', type: 'premium' },
        ]
    },
    {
        title: 'Premium',
        description: 'Elegant and bold designs to make you stand out.',
        price: 700,
        usdPrice: 2.5,
        templates: [
            { id: 'elegant', name: 'Elegant', type: 'premium' },
            { id: 'bold', name: 'Bold', type: 'premium' },
            { id: 'academic', name: 'Academic', type: 'premium' },
            { id: 'tech', name: 'Tech', type: 'premium' },
            { id: 'designer', name: 'Designer', type: 'premium' },
        ]
    },
    {
        title: 'Executive',
        description: 'Top-tier templates for leadership and artistic roles.',
        price: 900,
        usdPrice: 3,
        templates: [
            { id: 'corporate', name: 'Corporate', type: 'premium' },
            { id: 'artistic', name: 'Artistic', type: 'premium' },
            { id: 'sleek', name: 'Sleek', type_of: 'premium' },
            { id: 'vintage', name: 'Vintage', type_of: 'premium' },
            { id: 'premium-plus', name: 'Premium Plus', type_of: 'premium' },
        ]
    },
    {
        title: 'Platinum',
        description: 'Exclusive designs for the ultimate professional impression.',
        price: 1500,
        usdPrice: 5,
        templates: [
            { id: 'platinum', name: 'Platinum', type: 'premium' },
            { id: 'luxe', name: 'Luxe', type: 'premium' },
            { id: 'visionary', name: 'Visionary', type: 'premium' },
            { id: 'prestige', name: 'Prestige', type: 'premium' },
            { id: 'avant-garde', name: 'Avant-Garde', type: 'premium' },
        ]
    },
];

const allTemplates = templateTiers.flatMap(tier => tier.templates.map(t => ({...t, price: tier.price, usdPrice: tier.usdPrice })));

const PendingTimer = ({ expiryTimestamp, templateId }: { expiryTimestamp: number, templateId: Template }) => {
    const { refreshStatus } = useCvContext();
    const [timeLeft, setTimeLeft] = useState(expiryTimestamp - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            const newTimeLeft = expiryTimestamp - Date.now();
            if (newTimeLeft <= 0) {
                clearInterval(interval);
                refreshStatus(); // re-check status when timer ends
            }
            setTimeLeft(newTimeLeft);
        }, 1000);

        return () => clearInterval(interval);
    }, [expiryTimestamp, refreshStatus]);

    if (timeLeft <= 0) {
        return null; // Or some "expired" message
    }
    
    const minutes = Math.floor((timeLeft / 1000) / 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);

    return (
        <div className="w-full text-center mt-2 text-xs text-amber-600 font-medium bg-amber-100 px-2 py-1 rounded-md flex items-center justify-center gap-1">
            <Clock className="h-3 w-3"/>
            <span>Pending... ({`${minutes}:${seconds.toString().padStart(2, '0')}`})</span>
        </div>
    )
}


export function CvPreviewPanel() {
  const { cvData, template, setTemplate, isPremiumUnlocked, accentColor, setAccentColor, backgroundColor, setBackgroundColor, fontFamily, setFontFamily, pendingTemplate, refreshStatus } = useCvContext();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [templateToPurchase, setTemplateToPurchase] = useState<Template | null>(null);
  const [trxId, setTrxId] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('easypaisa');
  const printRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  
  const selectedTemplateDetails = allTemplates.find(t => t.id === template);
  const isCurrentTemplatePremium = selectedTemplateDetails?.type === 'premium';
  const isCurrentTemplateUnlocked = !isCurrentTemplatePremium || isPremiumUnlocked;
  const currentPrice = allTemplates.find(t => t.id === templateToPurchase)?.price;
  const currentUsdPrice = allTemplates.find(t => t.id === templateToPurchase)?.usdPrice;

  const handleUnlockAndDownload = (downloadFn: () => void) => {
     if (isCurrentTemplatePremium && !isCurrentTemplateUnlocked) {
      toast({
        title: 'Premium Template Locked',
        description: 'Please complete payment to unlock this template for download.',
        variant: 'destructive',
      });
      setTemplateToPurchase(template);
      setIsPaymentDialogOpen(true);
      return;
    }
    downloadFn();
  }

  const handleDownloadPdf = () => {
    window.print();
  };
  
  const handleDownloadImage = async (format: 'png' | 'jpeg') => {
    const node = printRef.current;
    if (!node) {
        toast({ title: 'Error', description: 'Could not find CV to download.', variant: 'destructive'});
        return;
    };
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
  
  const handleTemplateChange = (value: Template) => {
    const newTemplate = allTemplates.find(t => t.id === value);
    if(newTemplate?.type === 'premium' && !isPremiumUnlocked){
        setTemplateToPurchase(newTemplate.id);
    }
    setTemplate(value);
  }
  
  const handlePurchaseClick = (e: React.MouseEvent, templateId: Template) => {
    e.preventDefault();
    e.stopPropagation();
    setTemplateToPurchase(templateId);
    setTemplate(templateId);
    setIsPaymentDialogOpen(true);
  }

  const handlePaymentSubmit = async () => {
    if (!trxId || !templateToPurchase) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a transaction ID and select a template.',
        variant: 'destructive',
      });
      return;
    }
    if (!receipt) {
       toast({
        title: 'Missing Receipt',
        description: 'Please upload a payment receipt screenshot.',
        variant: 'destructive',
      });
      return;
    }
    
    const username = localStorage.getItem('cv-username');
    if(!username) {
        toast({ title: 'Error', description: 'Username not found. Please refresh.', variant: 'destructive' });
        return;
    }

    setIsSubmitting(true);

    const reader = new FileReader();
    reader.readAsDataURL(receipt);
    reader.onloadend = async () => {
        const receiptDataUrl = reader.result as string;
        try {
          await submitPayment({ 
            username: username,
            transactionId: trxId, 
            userEmail: cvData.personalDetails.email || "not-provided",
            templateId: templateToPurchase,
            receiptDataUrl: receiptDataUrl,
          });
          
          setIsPaymentDialogOpen(false);
          setTrxId('');
          setReceipt(null);

          toast({
            title: 'Payment Submitted!',
            description: 'Your payment is under review. Please wait for approval.',
            className: 'bg-green-500 text-white',
          });
          
          // Manually trigger a status refresh
          refreshStatus();

        } catch (error) {
          toast({
            title: 'Submission Failed',
            description: 'Could not submit payment details. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsSubmitting(false);
        }
    };
    reader.onerror = () => {
        toast({ title: "Error", description: "Failed to read file.", variant: "destructive"});
        setIsSubmitting(false);
    }
  }

  const handleShare = () => {
    const subject = `CV from ${cvData.personalDetails.name || 'a candidate'}`;
    const body = `${shareMessage}\n\nTo view the CV, please download the attached PDF.\n\n(Note: This is a sample app. In a real app, you would attach the PDF or provide a secure link.)`;
    const mailtoLink = `mailto:${shareEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    setIsShareDialogOpen(false);
  }

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceipt(file);
    }
  };
  
  const paymentMethods = [
    { id: 'easypaisa', name: 'Easypaisa', icon: <QuickCvIcon className="h-6 w-6"/> },
    { id: 'bank', name: 'Bank Account', icon: <CreditCard className="h-6 w-6"/> },
    { id: 'paypal', name: 'PayPal', icon: <p className="font-bold text-lg">P</p> },
    { id: 'stripe', name: 'Stripe', icon: <CreditCard className="h-6 w-6"/> },
  ];

  return (
    <>
      <Card className="overflow-hidden shadow-lg border-none" id="templates">
        <CardHeader className="bg-muted/30 p-4 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CV Preview & Tools
          </CardTitle>
          <CardDescription>Select a template and use tools to perfect your CV.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          <div className="space-y-4">
              <Label className="font-semibold flex items-center gap-2 text-base"><Palette className="h-5 w-5"/>Choose Your Template</Label>
              <RadioGroup value={template} onValueChange={(value) => handleTemplateChange(value as Template)}>
                {templateTiers.map(tier => (
                  <div key={tier.title} className="p-4 rounded-lg border bg-background">
                    <h3 className="font-bold text-lg">{tier.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                       {tier.templates.map((temp) => (
                        <div key={temp.id}>
                          <RadioGroupItem value={temp.id} id={temp.id} className="sr-only" />
                          <Label
                            htmlFor={temp.id}
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 text-center h-full hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary relative transition-all"
                          >
                            <span className="font-semibold text-sm mb-1">{temp.name}</span>
                            {temp.type === 'free' ? (
                               <span className="text-xs text-green-600 font-medium mt-2 block bg-green-100 px-2 py-0.5 rounded-full">Free</span>
                            ) : isPremiumUnlocked && template === temp.id ? (
                               <span className="flex items-center gap-1 text-xs text-green-600 mt-2">
                                    <CheckCircle className="h-3 w-3" /> Unlocked
                                </span>
                            ) : pendingTemplate && pendingTemplate.id === temp.id ? (
                                <PendingTimer expiryTimestamp={pendingTemplate.until} templateId={temp.id} />
                            ) : (
                                <Button size="sm" variant="ghost" className="w-full text-center mt-2 h-auto py-1 px-2" onClick={(e) => handlePurchaseClick(e, temp.id) }>
                                    <div className='flex flex-col'>
                                        <span className="text-sm text-primary font-semibold block">{tier.price} PKR / ~${tier.usdPrice}</span>
                                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                                            <Lock className="h-3 w-3"/>
                                            <span>Purchase</span>
                                        </div>
                                    </div>
                                </Button>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </RadioGroup>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="font-semibold flex items-center gap-2"><Palette className="h-4 w-4"/>Accent Color</Label>
              <div className="flex flex-wrap gap-3">
                {accentColors.map((color) => (
                   <button
                      key={color}
                      type="button"
                      className={cn(
                        'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                        color === accentColor ? 'border-primary' : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setAccentColor(color)}
                      aria-label={`Set color to ${color}`}
                   >
                      {color === accentColor && <Check className="h-5 w-5 text-white mx-auto" />}
                   </button>
                ))}
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
          </div>
          <div className="space-y-3">
            <Label className="font-semibold flex items-center gap-2"><Paintbrush className="h-4 w-4"/>Background</Label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(backgroundColors).map(([name, color]) => (
                 <button
                    key={name}
                    type="button"
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center',
                      color === backgroundColor ? 'border-primary' : 'border-muted-foreground'
                    )}
                    style={{ background: color }}
                    onClick={() => setBackgroundColor(color)}
                    aria-label={`Set background to ${name}`}
                 >
                    {name === 'gradient' && <ImageIcon className="h-4 w-4 text-white/70" />}
                    {color === backgroundColor && <Check className="h-5 w-5 text-primary-foreground mix-blend-difference mx-auto" />}
                 </button>
              ))}
            </div>
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
                      <ChevronDown className="ml-2 h-4 w-4" />
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
      
      {/* This wrapper is used for printing and image generation */}
      <div className="hidden print:block fixed top-0 left-0">
        <div ref={printRef} className="cv-print-area">
          <CvPreview
            data={cvData}
            template={template}
            accentColor={accentColor}
            backgroundColor={backgroundColor}
            fontFamily={fontFamily}
          />
        </div>
      </div>


      {/* This is for on-screen preview */}
      <div className="mt-8 rounded-lg overflow-hidden shadow-2xl shadow-primary/10 print:hidden">
        <div ref={previewRef} className="aspect-[210/297] w-full">
           <CvPreview
            data={cvData}
            template={template}
            accentColor={accentColor}
            backgroundColor={backgroundColor}
            fontFamily={fontFamily}
            isPremiumLocked={isCurrentTemplatePremium && !isCurrentTemplateUnlocked}
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
      
       <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
             <div className="mx-auto w-fit mb-4 p-3 bg-primary/10 rounded-full">
                <QuickCvIcon className="h-10 w-10 text-primary" />
             </div>
            <DialogTitle className="text-center text-2xl">Unlock Premium Access</DialogTitle>
            <DialogDescription className="text-center">
              Purchase the "{allTemplates.find(t => t.id === templateToPurchase)?.name}" template for 24 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 gap-2 mb-4">
                {paymentMethods.map(method => (
                    <Button 
                        key={method.id} 
                        variant={selectedPaymentMethod === method.id ? 'default' : 'outline'}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className="flex items-center justify-start gap-2 p-2 h-auto"
                        disabled={!['easypaisa', 'bank'].includes(method.id)} // Only enable bank/easypaisa for this demo
                    >
                       {method.icon}
                        <span className="text-sm">{method.name}</span>
                    </Button>
                ))}
            </div>
            
            <div className="p-4 bg-muted rounded-lg text-center my-4">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-3xl font-bold font-mono tracking-wider text-primary">{currentPrice || "N/A"} PKR</p>
                <p className="text-xs text-muted-foreground">~ ${currentUsdPrice || "N/A"} USD</p>
            </div>
            
            {(selectedPaymentMethod === 'easypaisa' || selectedPaymentMethod === 'bank') && (
                <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Please transfer to the account below and submit your Transaction ID and receipt for verification.
                    </p>
                    {selectedPaymentMethod === 'easypaisa' && (
                        <div className="p-3 bg-background rounded-lg border">
                            <p className="text-xs text-muted-foreground">EasyPaisa Account</p>
                            <p className="text-lg font-bold font-mono tracking-wider">03465496360</p>
                        </div>
                    )}
                    {selectedPaymentMethod === 'bank' && (
                         <div className="p-3 bg-background rounded-lg border text-left text-sm">
                            <p><span className="font-semibold">Account Title:</span> Raja Huzaifa</p>
                            <p><span className="font-semibold">Account Number:</span> 03465496360</p>
                            <p><span className="font-semibold">Bank Name:</span> Sadapay</p>
                        </div>
                    )}
                    <div className='space-y-2 text-left'>
                        <Label htmlFor="trxId">Transaction ID</Label>
                        <Input id="trxId" placeholder="e.g., 1234567890" value={trxId} onChange={e => setTrxId(e.target.value)} />
                    </div>
                     <div className='space-y-2 text-left'>
                        <Label htmlFor="receipt">Payment Receipt</Label>
                         <Button asChild variant="outline" className="w-full">
                            <label htmlFor="receipt-upload" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            {receipt ? `Selected: ${receipt.name}` : 'Upload Screenshot'}
                            <input id="receipt-upload" type="file" className="sr-only" accept="image/*" onChange={handleReceiptUpload} />
                            </label>
                        </Button>
                    </div>
                </div>
            )}
            {!['easypaisa', 'bank'].includes(selectedPaymentMethod) && (
                <div className="text-center text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                    <p>This payment method is for demonstration only.</p>
                    <p>Please select "Easypaisa" or "Bank Account" to continue.</p>
                </div>
            )}
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button onClick={handlePaymentSubmit} disabled={isSubmitting || !['easypaisa', 'bank'].includes(selectedPaymentMethod)}>
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </Button>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
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
