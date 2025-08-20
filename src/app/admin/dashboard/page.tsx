import { getPayments, getUsers, getAds } from '@/lib/actions';
import { Header } from '@/components/header';
import { AdminDashboardClient } from './_components/admin-dashboard-client';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default async function AdminDashboardPage() {
    // Fetch initial data directly in the Server Component
    const initialPayments = await getPayments();
    const initialUsers = await getUsers();
    const initialAds = await getAds();
    
    return (
        <div className="flex flex-col min-h-screen bg-secondary/30">
            <Header />
            <main className="flex-1 container max-w-7xl mx-auto p-4 md:p-8">
                {/* Pass initial data to the client component */}
                <AdminDashboardClient 
                    initialPayments={initialPayments} 
                    initialUsers={initialUsers} 
                    initialAds={initialAds} 
                />
            </main>
        </div>
    );
}

    