'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPayments, approvePayment } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { CheckCircle, Clock } from 'lucide-react';
import type { Payment } from '@/lib/types';


export default function AdminDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Protect this route
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      router.push('/admin/login');
      return;
    }

    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const data = await getPayments();
        setPayments(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch payment data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [router, toast]);

  const handleApprove = async (transactionId: string) => {
    try {
      await approvePayment(transactionId);
      setPayments(prev =>
        prev.map(p => (p.transactionId === transactionId ? { ...p, status: 'approved' } : p))
      );
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
        <main className="flex-1 container max-w-5xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
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
                                <TableHead>User Email</TableHead>
                                <TableHead>Template</TableHead>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        No payment submissions yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map((payment) => (
                                <TableRow key={payment.transactionId}>
                                    <TableCell className="font-medium">{payment.userEmail}</TableCell>
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
        </main>
    </div>
  );
}
