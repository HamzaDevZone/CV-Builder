
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getPayments, approvePayment, getUsers, createAd, deleteAd, getAds } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, Eye, Users, CreditCard, ArrowLeft, Trash2, PlusCircle, Megaphone, Image as ImageIcon } from 'lucide-react';
import type { Payment, User, Ad } from '@/lib/types';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

function AdManagement({ initialAds }: { initialAds: Ad[] }) {
  const [ads, setAds] = useState(initialAds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreateAd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const data = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      imageUrl: formData.get('imageUrl') as string,
    };

    if (!data.title || !data.content || !data.imageUrl) {
        toast({ title: 'Error', description: 'Please fill all fields.', variant: 'destructive'});
        setIsSubmitting(false);
        return;
    }

    try {
      await createAd(data);
      toast({ title: 'Success', description: 'Ad created successfully.', className: 'bg-green-500 text-white' });
      (event.target as HTMLFormElement).reset();
      const updatedAds = await getAds();
      setAds(updatedAds);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create ad.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    setIsDeleting(adId);
    try {
      await deleteAd(adId);
      toast({ title: 'Success', description: 'Ad deleted successfully.' });
      setAds(ads.filter(ad => ad.id !== adId));
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete ad.', variant: 'destructive' });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Create New Ad</CardTitle>
            <CardDescription>Post a new ad that will be displayed in the app.</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateAd}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title">Ad Title</label>
                <Input id="title" name="title" placeholder="e.g., Special Offer!" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="content">Ad Content</label>
                <Textarea id="content" name="content" placeholder="Describe the ad..." required />
              </div>
              <div className="space-y-2">
                <label htmlFor="imageUrl">Image URL</label>
                <Input id="imageUrl" name="imageUrl" placeholder="https://placehold.co/300x100.png" defaultValue="https://placehold.co/300x100.png" required />
                 <p className="text-xs text-muted-foreground">Use a service like <a href="https://placehold.co" target="_blank" className="underline">placehold.co</a> for placeholder images.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Posting...' : 'Post Ad'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <div className="lg:col-span-2">
         <Card>
            <CardHeader>
                <CardTitle>Current Ads</CardTitle>
                <CardDescription>List of all active ads.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Content</TableHead>
                                <TableHead>Created At</TableHead>
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
                                    <Image src={ad.imageUrl} alt={ad.title} width={100} height={50} className="rounded-md object-cover" data-ai-hint="advertisement banner" />
                                </TableCell>
                                <TableCell className="font-medium">{ad.title}</TableCell>
                                <TableCell className="text-muted-foreground text-xs max-w-xs truncate">{ad.content}</TableCell>
                                <TableCell>{new Date(ad.createdAt).toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button size="icon" variant="destructive" onClick={() => handleDeleteAd(ad.id)} disabled={isDeleting === ad.id}>
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
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const paymentsData = await getPayments();
      const usersData = await getUsers();
      setPayments(paymentsData);
      setUsers(usersData);
    } catch (error) {
       toast({
        title: 'Error',
        description: 'Failed to refresh data.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      router.push('/admin/login');
      return;
    }
  }, [router]);
  
  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchData]);


  const handleApprove = async (transactionId: string) => {
    setIsApproving(transactionId);
    try {
      await approvePayment(transactionId);
      // Data will be refetched by the polling mechanism, but we can also trigger it manually
      await fetchData();
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
    } finally {
        setIsApproving(null);
    }
  };

  return (
    <>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
             <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
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
                    <div className="border rounded-lg">
                        <Table>
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
                                        <Button asChild variant="outline" size="sm">
                                          <Link href={payment.receiptDataUrl} target="_blank" rel="noopener noreferrer">
                                            <Eye className="mr-2 h-4 w-4"/>
                                            View
                                          </Link>
                                        </Button>
                                      ) : (
                                        <span className="text-muted-foreground">N/A</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                    {payment.status === 'pending' && (
                                        <Button size="sm" onClick={() => handleApprove(payment.transactionId)} disabled={isApproving === payment.transactionId}>
                                          {isApproving === payment.transactionId ? 'Approving...' : 'Approve'}
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
                    <div className="border rounded-lg">
                        <Table>
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
             <AdManagement initialAds={initialAds} />
           </TabsContent>
        </Tabs>
    </>
  );
}
