
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getPayments, approvePayment, getUsers } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, Eye, Users, CreditCard, ArrowLeft } from 'lucide-react';
import type { Payment, User } from '@/lib/types';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export function AdminDashboardClient({ initialPayments, initialUsers }: { initialPayments: Payment[], initialUsers: User[] }) {
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
          <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="payments"><CreditCard className="mr-2 h-4 w-4"/>Payments</TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-2 h-4 w-4"/>Users</TabsTrigger>
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
        </Tabs>
    </>
  );
}
