'use client';

import { useState } from 'react';
import { useCvContext } from '@/context/cv-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Sparkles, Lock, FileText, Palette } from 'lucide-react';
import { CvPreview } from './cv-preview';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { serializeCvData } from '@/lib/utils';
import { Separator } from './ui/separator';

export function CvPreviewPanel() {
  const { cvData, template, setTemplate, isPremiumUnlocked, unlockPremium } = useCvContext();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    if (template === 'modern' && !isPremiumUnlocked) {
      toast({
        title: 'Premium Template Locked',
        description: 'Please unlock this template to download.',
        variant: 'destructive',
      });
      setIsPaymentDialogOpen(true);
      return;
    }
    window.print();
  };

  const handleAiEnhance = async () => {
    setIsAiLoading(true);
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
  
  const handleTemplateChange = (value: 'classic' | 'modern') => {
    if (value === 'modern' && !isPremiumUnlocked) {
      setIsPaymentDialogOpen(true);
    }
    setTemplate(value);
  }

  const handlePaymentConfirm = () => {
    unlockPremium();
    setIsPaymentDialogOpen(false);
    toast({
      title: 'Success!',
      description: 'Premium template unlocked.',
    });
  }

  return (
    <>
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-muted/30 p-4 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CV Preview & Tools
          </CardTitle>
          <CardDescription>Select a template and use tools to perfect your CV.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          <div className="space-y-2">
            <Label className="font-semibold flex items-center gap-2"><Palette className="h-4 w-4"/>Template</Label>
             <RadioGroup
              value={template}
              onValueChange={(value) => handleTemplateChange(value as 'classic' | 'modern')}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="classic" id="classic" className="sr-only" />
                <Label htmlFor="classic" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary">
                  Classic
                  <span className="text-xs text-muted-foreground">Free</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="modern" id="modern" className="sr-only" />
                <Label htmlFor="modern" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary relative">
                  Modern
                  <span className="text-xs text-muted-foreground">$5.00</span>
                  {!isPremiumUnlocked && <Lock className="h-3 w-3 absolute top-2 right-2 text-primary" />}
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Separator/>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleAiEnhance} disabled={isAiLoading} className="w-full bg-primary/90 hover:bg-primary">
              <Sparkles className="mr-2 h-4 w-4" />
              {isAiLoading ? 'Analyzing...' : 'Enhance with AI'}
            </Button>
            <Button onClick={handleDownload} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download as PDF
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="mt-8">
        <div className="aspect-[210/297] cv-print-area">
          <CvPreview
            data={cvData}
            template={template}
            isPremium={template === 'modern' && !isPremiumUnlocked}
          />
        </div>
      </div>
      
      {/* AI Feedback Dialog */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/>AI Feedback</DialogTitle>
            <DialogDescription>
              Here are some suggestions to improve your CV.
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-h-[60vh] overflow-y-auto p-1 rounded-lg">
            <pre className="whitespace-pre-wrap font-body text-sm text-foreground bg-secondary p-4 rounded-md">{aiFeedback}</pre>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsFeedbackDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Premium Template</DialogTitle>
            <DialogDescription>
              To purchase the Modern template for $5 (or equivalent PKR), please complete the payment via EasyPaisa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="p-4 bg-muted rounded-lg text-center">
                <p className="font-semibold">EasyPaisa Account</p>
                <p className="text-2xl font-bold font-mono tracking-wider text-primary">03465496360</p>
            </div>
            <p className="text-xs text-muted-foreground">After payment, please enter the Transaction ID and upload a screenshot of your receipt. An admin will verify your purchase.</p>
            <div className='space-y-2'>
                <Label htmlFor="trxId">Transaction ID</Label>
                <Input id="trxId" placeholder="e.g., 1234567890" />
            </div>
             <div className='space-y-2'>
                <Label htmlFor="receipt">Payment Screenshot</Label>
                <Input id="receipt" type="file" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
            <Button className="bg-accent hover:bg-accent/90" onClick={handlePaymentConfirm}>Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
