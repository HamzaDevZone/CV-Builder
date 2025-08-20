
'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getPayments, approvePayment, getUsers, createAd, deleteAd, getAds } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, Eye, Users, CreditCard, ArrowLeft, Trash2, PlusCircle, Megaphone, Image as ImageIcon, Link2 } from 'lucide-react';
import type { Payment, User, Ad } from '@/lib/types';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

function AdManagement({ ads, onDataChange }: { ads: Ad[], onDataChange: () => void }) {
  const [imageUrl, setImageUrl] = useState("https://placehold.co/300x100.png");
  const [isLoading, startTransition] = useTransition();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const handleCreateAd = async (formData: FormData) => {
    startTransition(async () => {
        try {
            await createAd(formData);
            toast({ title: 'Success', description: 'Ad created successfully.', className: 'bg-green-500 text-white' });
            setImageUrl("https://placehold.co/300x100.png");
            formRef.current?.reset();
            onDataChange();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            toast({ title: 'Error Creating Ad', description: message, variant: 'destructive' });
        }
    });
  };
  
  const handleDeleteAd = async (adId: string) => {
     startTransition(async () => {
        try {
          await deleteAd(adId);
          toast({ title: 'Success', description: 'Ad deleted successfully.' });
          onDataChange();
        } catch (error) {
          toast({ title: 'Error', description: 'Failed to delete ad.', variant: 'destructive' });
        }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Create New Ad</CardTitle>
            <CardDescription>Post a new ad for a brand, store, or restaurant.</CardDescription>
          </CardHeader>
          <form action={handleCreateAd} ref={formRef}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="brandName">Brand Name</label>
                <Input id="brandName" name="brandName" placeholder="e.g., Nike, Pizza Hut" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="offer">Offer / Slogan</label>
                <Textarea id="offer" name="offer" placeholder="e.g., 50% off on all items!" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="linkUrl">Link to Store</label>
                <Input id="linkUrl" name="linkUrl" type="url" placeholder="https://store-link.com" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="imageUrl">Image URL</label>
                <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://placehold.co/300x100.png" defaultValue={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
                 <p className="text-xs text-muted-foreground">Use a service like <a href="https://placehold.co" target="_blank" className="underline">placehold.co</a> for placeholder images.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {isLoading ? 'Posting...' : 'Post Ad'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <div className="lg:col-span-2">
         <Card>
            <CardHeader>
                <CardTitle>Current Ads</CardTitle>
                <CardDescription>List of all active brand promotions.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="border rounded-lg overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Brand Name</TableHead>
                                <TableHead>Offer</TableHead>
                                <TableHead>Link</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {ads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No ads posted yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                           ads.map((ad) => (
                            <TableRow key={ad.id}>
                                <TableCell>
                                    <Image src={ad.imageUrl} alt={ad.brandName} width={100} height={50} className="rounded-md object-cover" data-ai-hint="advertisement banner" />
                                </TableCell>
                                <TableCell className="font-medium">{ad.brandName}</TableCell>
                                <TableCell className="text-muted-foreground text-xs max-w-xs truncate">{ad.offer}</TableCell>
                                <TableCell>
                                  <Button asChild variant="outline" size="sm">
                                    <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer">
                                      <Link2 className="mr-2 h-3 w-3" />
                                      Visit
                                    </a>
                                  </Button>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="icon" variant="destructive" onClick={() => handleDeleteAd(ad.id)} disabled={isLoading}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                           ))
                        )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}


export function AdminDashboardClient({ initialPayments, initialUsers, initialAds }: { initialPayments: Payment[], initialUsers: User[], initialAds: Ad[] }) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [ads, setAds] = useState<Ad[]>(initialAds);
  const [isDataLoading, startDataTransition] = useTransition();
  const [isActionLoading, startActionTransition] = useTransition();
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const fetchData = useCallback(() => {
    startDataTransition(async () => {
        try {
            const [paymentsData, usersData, adsData] = await Promise.all([
                getPayments(),
                getUsers(),
                getAds()
            ]);
            setPayments(paymentsData);
            setUsers(usersData);
            setAds(adsData);
        } catch (error) {
           toast({
            title: 'Error',
            description: 'Failed to refresh data.',
            variant: 'destructive',
          });
        }
    });
  }, [toast]);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      router.push('/admin/login');
    }
  }, [router]);
  

  const handleApprove = (transactionId: string) => {
    startActionTransition(async () => {
      try {
        await approvePayment(transactionId);
        fetchData();
        toast({
          title: 'Success',
          description: `Payment ${transactionId} approved.`,
          className: 'bg-green-500 text-white',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to approve payment.',
          variant: 'destructive',
        });
      }
    });
  };

  const isLoading = isDataLoading || isActionLoading;

  return (
    <>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
             <Button variant="outline" asChild>
                 <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to App
                 </Link>
            </Button>
        </div>
        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="payments"><CreditCard className="mr-2 h-4 w-4"/>Payments</TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-2 h-4 w-4"/>Users</TabsTrigger>
            <TabsTrigger value="ads"><Megaphone className="mr-2 h-4 w-4"/>Ads</TabsTrigger>
          </TabsList>
          <TabsContent value="payments">
            <Card>
                <CardHeader>
                <CardTitle>Payment Submissions</CardTitle>
                <CardDescription>Review and approve user payments for premium access.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Template</TableHead>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Receipt</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24">
                                        No payment submissions yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map((payment) => (
                                <TableRow key={payment.transactionId}>
                                    <TableCell className="font-medium">{payment.username}</TableCell>
                                    <TableCell>{payment.userEmail}</TableCell>
                                    <TableCell className='capitalize'>{payment.templateId}</TableCell>
                                    <TableCell>{payment.transactionId}</TableCell>
                                    <TableCell>{new Date(payment.timestamp).toLocaleString()}</TableCell>
                                    <TableCell>
                                    <Badge variant={payment.status === 'approved' ? 'default' : 'secondary'} className={payment.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                                        {payment.status === 'approved' ? 
                                            <CheckCircle className="mr-1 h-3 w-3" /> :
                                            <Clock className="mr-1 h-3 w-3" />
                                        }
                                        {payment.status}
                                    </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {payment.receiptDataUrl ? (
                                        <Button variant="outline" size="sm" onClick={() => setViewingReceiptUrl(payment.receiptDataUrl as string)}>
                                            <Eye className="mr-2 h-4 w-4"/>
                                            View
                                        </Button>
                                      ) : (
                                        <span className="text-muted-foreground">N/A</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                    {payment.status === 'pending' && (
                                        <Button size="sm" onClick={() => handleApprove(payment.transactionId)} disabled={isLoading}>
                                          {isLoading ? 'Approving...' : 'Approve'}
                                        </Button>
                                    )}
                                    </TableCell>
                                </TableRow>
                                ))
                            )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="users">
             <Card>
                <CardHeader>
                <CardTitle>User List</CardTitle>
                <CardDescription>A list of all users who have submitted a payment.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-x-auto">
                        <Table className="min-w-full">
                            <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>First Seen</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                <TableRow key={user.username}>
                                    <TableCell className="font-medium">{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{new Date(user.firstSeen).toLocaleString()}</TableCell>
                                </TableRow>
                                ))
                            )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="ads">
             <AdManagement ads={ads} onDataChange={fetchData} />
           </TabsContent>
        </Tabs>

        {/* Receipt Viewing Dialog */}
        <Dialog open={!!viewingReceiptUrl} onOpenChange={(isOpen) => !isOpen && setViewingReceiptUrl(null)}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Payment Receipt</DialogTitle>
                    <DialogDescription>Image of the receipt uploaded by the user.</DialogDescription>
                </DialogHeader>
                <div className="mt-4 max-h-[70vh] overflow-y-auto">
                    {viewingReceiptUrl && (
                        <Image src={viewingReceiptUrl} alt="Payment Receipt" width={800} height={1200} className="w-full h-auto object-contain rounded-md" />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </>
  );
}

    