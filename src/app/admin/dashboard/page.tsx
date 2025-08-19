import { getPayments, getUsers } from '@/lib/actions';
import { Header } from '@/components/header';
import { AdminDashboardClient } from './_components/admin-dashboard-client';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default async function AdminDashboardPage() {
    
  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
        <Header />
        <main className="flex-1 container max-w-7xl mx-auto p-4 md:p-8">
            <Suspense fallback={<DashboardSkeleton/>}>
                <DashboardDataLoader />
            </Suspense>
        </main>
    </div>
  );
}


async function DashboardDataLoader(){
    const initialPayments = await getPayments();
    const initialUsers = await getUsers();

    return <AdminDashboardClient initialPayments={initialPayments} initialUsers={initialUsers} />
}

function DashboardSkeleton() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-12 w-96" />
        <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
}
