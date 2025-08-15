'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getPayments, approvePayment, getUsers } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { CheckCircle, Clock, Eye, Users, CreditCard } from 'lucide-react';
import type { Payment, User } from '@/lib/types';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export default function AdminDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const paymentsData = await getPayments();
      setPayments(paymentsData);
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch admin data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [router, fetchData]);

  const handleApprove = async (transactionId: string) => {
    try {
      await approvePayment(transactionId);
      // Refetch data to show the updated status
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
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
        <Header />
        <main className="flex-1 container max-w-7xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
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
                    {isLoading ? (
                        <p>Loading payments...</p>
                    ) : (
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
                                            <Button size="sm" onClick={() => handleApprove(payment.transactionId)}>
                                            Approve
                                            </Button>
                                        )}
                                        </TableCell>
                                    </TableRow>
                                    ))
                                )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
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
                    {isLoading ? (
                        <p>Loading users...</p>
                    ) : (
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
                    )}
                    </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
        </main>
    </div>
  );
}
