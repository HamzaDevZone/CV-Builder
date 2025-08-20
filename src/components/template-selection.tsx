

'use client'

import { useState } from 'react';
import { useCvContext, templateColors } from '@/context/cv-context';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle, Clock, Upload, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitPayment } from '@/lib/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import type { Template } from '@/lib/types';
import { QuickCvIcon } from './icons';
import { useRouter } from 'next/navigation';
import { PendingTimer } from './pending-timer';
import { templateTiers } from '@/lib/template-tiers';


const allTemplates = templateTiers.flatMap(tier => tier.templates.map(t => ({...t, price: tier.price, usdPrice: tier.usdPrice })));

export function TemplateSelection() {
    const { isPremiumUnlocked, pendingTemplate, cvData, refreshStatus } = useCvContext();
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [templateToPurchase, setTemplateToPurchase] = useState<Template | null>(null);
    const [trxId, setTrxId] = useState('');
    const [receipt, setReceipt] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('easypaisa');
    const { toast } = useToast();
    const router = useRouter();

    const currentPrice = allTemplates.find(t => t.id === templateToPurchase)?.price;
    const currentUsdPrice = allTemplates.find(t => t.id === templateToPurchase)?.usdPrice;

    const handleSelectTemplate = (templateId: Template) => {
        const isUnlocked = templateId === 'classic' || isPremiumUnlocked(templateId);
        if (isUnlocked) {
            router.push(`/${templateId}/build`);
        } else {
            setTemplateToPurchase(templateId);
            setIsPaymentDialogOpen(true);
        }
    }

    const handlePurchaseClick = (e: React.MouseEvent, templateId: Template) => {
        e.preventDefault();
        e.stopPropagation();
        setTemplateToPurchase(templateId);
        setIsPaymentDialogOpen(true);
    }

    const handlePaymentSubmit = async () => {
        if (!trxId || !templateToPurchase) {
          toast({
            title: 'Missing Information',
            description: 'Please provide a transaction ID.',
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
            <div className="space-y-8">
            {templateTiers.map(tier => (
              <div key={tier.title} className="p-4 rounded-lg border bg-card/50">
                <h3 className="font-bold text-2xl">{tier.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                   {tier.templates.map((temp) => {
                      const isUnlocked = temp.type === 'free' || isPremiumUnlocked(temp.id);
                      const isPending = pendingTemplate?.id === temp.id && pendingTemplate.until > Date.now();

                      return (
                        <div 
                            key={temp.id}
                            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group"
                            onClick={() => handleSelectTemplate(temp.id)}
                        >
                            <div className="p-4 h-40 flex items-center justify-center text-center relative" style={{backgroundColor: templateColors[temp.id]?.background ?? '#f0f0f0'}}>
                                <span className="font-bold text-xl" style={{color: templateColors[temp.id]?.accent ?? '#333'}}>{temp.name}</span>
                                {templateColors[temp.id]?.background && (
                                     <div className='absolute top-2 right-2 w-5 h-5 rounded-full border border-black/10' style={{background: templateColors[temp.id].background}}></div>
                                )}
                            </div>
                            <div className='p-4 bg-background'>
                                <h4 className="font-semibold text-lg">{temp.name}</h4>
                                {isPending ? (
                                    <div className="w-full text-center mt-2 text-xs text-amber-600 font-medium bg-amber-100 px-2 py-1 rounded-md flex items-center justify-center gap-1">
                                        <Clock className="h-3 w-3"/>
                                        <span>Pending Review</span>
                                        <PendingTimer expiryTimestamp={pendingTemplate!.until} />
                                    </div>
                               ) : isUnlocked ? (
                                    <>
                                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                                            <CheckCircle className="h-4 w-4" /> Unlocked
                                        </div>
                                        <Button className="w-full mt-2" onClick={() => handleSelectTemplate(temp.id)}>
                                            Let's Build
                                        </Button>
                                    </>
                               ) : (
                                    <>
                                        <p className="text-sm text-primary font-semibold block">{tier.price} PKR / ~${tier.usdPrice}</p>
                                        <Button className="w-full mt-2" onClick={(e) => handlePurchaseClick(e, temp.id) }>
                                            <Lock className="mr-2 h-4 w-4"/>
                                            Purchase
                                        </Button>
                                    </>
                               )}
                            </div>
                        </div>
                      )
                   })}
                </div>
              </div>
            ))}
          </div>

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
                            <label htmlFor="trxId">Transaction ID</label>
                            <Input id="trxId" placeholder="e.g., 1234567890" value={trxId} onChange={e => setTrxId(e.target.value)} />
                        </div>
                         <div className='space-y-2 text-left'>
                            <label htmlFor="receipt">Payment Receipt</label>
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
        </>
    );
}
