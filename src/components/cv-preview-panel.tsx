'use client';

import { useState } from 'react';
import { useCvContext, accentColors, backgroundColors, fonts } from '@/context/cv-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Sparkles, Lock, FileText, Palette, CheckCircle, Check, Paintbrush, Image as ImageIcon, Type, Share2, CreditCard, ExternalLink, Upload } from 'lucide-react';
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

const templates: { id: Template; name: string; type: 'free' | 'premium' }[] = [
    { id: 'classic', name: 'Classic', type: 'free' },
    { id: 'modern', name: 'Modern', type: 'premium' },
    { id: 'creative', name: 'Creative', type: 'premium' },
];

export function CvPreviewPanel() {
  const { cvData, template, setTemplate, isPremiumUnlocked, accentColor, setAccentColor, backgroundColor, setBackgroundColor, fontFamily, setFontFamily } = useCvContext();
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bank');
  
  const { toast } = useToast();
  
  const isCurrentTemplatePremium = templates.find(t => t.id === template)?.type === 'premium';
  const isCurrentTemplateUnlocked = !isCurrentTemplatePremium || isPremiumUnlocked;

  const handleDownload = () => {
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
    window.print();
  };

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
    const newTemplate = templates.find(t => t.id === value);
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
    setIsSubmitting(true);

    const reader = new FileReader();
    reader.readAsDataURL(receipt);
    reader.onloadend = async () => {
        const receiptDataUrl = reader.result as string;
        try {
          await submitPayment({ 
            userId: 'user-123', 
            transactionId: trxId, 
            userEmail: cvData.personalDetails.email || "not-provided",
            templateId: templateToPurchase,
            receiptDataUrl: receiptDataUrl,
          });
          
          setIsPaymentDialogOpen(false);
          setTemplateToPurchase(null);
          setTrxId('');
          setReceipt(null);

          toast({
            title: 'Payment Submitted!',
            description: 'Your payment is under review. An admin will approve it shortly.',
            className: 'bg-green-500 text-white',
          });
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
    { id: 'bank', name: 'Bank / EasyPaisa', icon: <CreditCard className="h-6 w-6"/> },
    { id: 'paypal', name: 'PayPal', icon: <p className="font-bold text-lg">P</p> },
    { id: 'stripe', name: 'Stripe', icon: <CreditCard className="h-6 w-6"/> },
    { id: 'crypto', name: 'Crypto', icon: <p className="font-bold text-lg">B</p> },
  ];

  return (
    <>
      <Card className="overflow-hidden shadow-lg border-none">
        <CardHeader className="bg-muted/30 p-4 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CV Preview & Tools
          </CardTitle>
          <CardDescription>Select a template and use tools to perfect your CV.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          <div className="space-y-3">
            <Label className="font-semibold flex items-center gap-2"><Palette className="h-4 w-4"/>Template</Label>
             <RadioGroup
              value={template}
              onValueChange={(value) => handleTemplateChange(value as Template)}
              className="grid grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {templates.map((temp) => (
                <div key={temp.id}>
                  <RadioGroupItem value={temp.id} id={temp.id} className="sr-only" />
                  <Label
                    htmlFor={temp.id}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary relative h-full"
                  >
                    {temp.name}
                    {temp.type === 'free' ? (
                       <span className="text-xs text-green-600 font-medium mt-2">Free</span>
                    ) : isPremiumUnlocked && template === temp.id ? (
                       <span className="flex items-center gap-1 text-xs text-green-600 mt-2">
                            <CheckCircle className="h-3 w-3" /> Unlocked
                        </span>
                    ) : (
                        <div className="w-full text-center mt-2" onClick={(e) => handlePurchaseClick(e, temp.id) }>
                            <span className="text-sm text-primary font-semibold block">1500 PKR</span>
                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                                <Lock className="h-3 w-3"/>
                                <span>Unlock</span>
                            </div>
                        </div>
                    )}
                  </Label>
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
            <Button onClick={handleDownload} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download as PDF
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* This wrapper is used for printing */}
      <div className="hidden print:block cv-print-area-wrapper">
        <div className="aspect-[210/297] cv-print-area">
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
        <div className="aspect-[210/297]">
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
              Purchase the "{templateToPurchase}" template for 24 hours.
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
                        disabled={method.id !== 'bank'} // Only enable bank for this demo
                    >
                       {method.icon}
                        <span className="text-sm">{method.name}</span>
                    </Button>
                ))}
            </div>
            
            <div className="p-4 bg-muted rounded-lg text-center my-4">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-3xl font-bold font-mono tracking-wider text-primary">1500 PKR</p>
                <p className="text-xs text-muted-foreground">~ $5 USD</p>
            </div>
            
            {selectedPaymentMethod === 'bank' && (
                <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Please transfer to the account below and submit your Transaction ID and receipt for verification.
                    </p>
                    <div className="p-3 bg-background rounded-lg border">
                        <p className="text-xs text-muted-foreground">EasyPaisa Account</p>
                        <p className="text-lg font-bold font-mono tracking-wider">03465496360</p>
                    </div>
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
            {selectedPaymentMethod !== 'bank' && (
                <div className="text-center text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                    <p>This payment method is for demonstration only.</p>
                    <p>Please select "Bank / EasyPaisa" to continue with the mock payment flow.</p>
                </div>
            )}
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button onClick={handlePaymentSubmit} disabled={isSubmitting || selectedPaymentMethod !== 'bank'}>
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
