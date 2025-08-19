
'use server';

import { cvEnhancementTool, type CvEnhancementToolInput } from "@/ai/flows/cv-enhancement-tool";
import type { Payment, Template, User } from './types';
import { unstable_cache as cache, revalidateTag } from 'next/cache';

// Mock database - This is a simple in-memory store.
// In a real production app, you would use a persistent database like Firestore.
// We make it a global to ensure it persists across server action calls in a development environment.
if (!global.payments) {
  global.payments = [];
}
const payments: Payment[] = global.payments;


export async function enhanceCv(input: CvEnhancementToolInput): Promise<string> {
    try {
        const result = await cvEnhancementTool(input);
        return result.feedback;
    } catch (error) {
        console.error("Error enhancing CV:", error);
        throw new Error("Failed to get AI feedback.");
    }
}

export async function submitPayment(data: { username: string; transactionId: string, userEmail: string; templateId: Template, receiptDataUrl: string; }) {
    console.log("Submitting payment for user:", data.username, "for template", data.templateId, "with email", data.userEmail);
    // Avoid duplicate pending payments based on transactionId
    const existingPayment = payments.find(p => p.transactionId === data.transactionId);
    if (existingPayment) {
        // If a payment with this ID already exists, just update its details
        existingPayment.username = data.username;
        existingPayment.userEmail = data.userEmail;
        existingPayment.templateId = data.templateId;
        existingPayment.receiptDataUrl = data.receiptDataUrl;
        existingPayment.status = 'pending';
        existingPayment.timestamp = new Date();
    } else {
       payments.push({ ...data, status: 'pending', timestamp: new Date() });
    }
    // Revalidate the cache for payments and users
    revalidateTag('payments');
    revalidateTag('users');
    console.log("Current payments count:", payments.length);
    return { success: true };
}

export const getPayments = cache(
    async (): Promise<Payment[]> => {
        // In a real app, you'd fetch this from a database
        // Return a deep copy to avoid mutation and ensure serializability
        const sortedPayments = [...payments].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return JSON.parse(JSON.stringify(sortedPayments));
    },
    ['payments'], // Cache key
    {
        tags: ['payments'], // Cache tag for revalidation
    }
);


export const getUsers = cache(
    async (): Promise<User[]> => {
        const userMap = new Map<string, User>();
        // Get the earliest payment for each user to determine "first seen"
        for (const payment of payments) {
            if (!userMap.has(payment.username)) {
                userMap.set(payment.username, {
                    username: payment.username,
                    email: payment.userEmail,
                    firstSeen: payment.timestamp,
                });
            } else {
                const existingUser = userMap.get(payment.username)!;
                if (new Date(payment.timestamp) < new Date(existingUser.firstSeen)) {
                    existingUser.firstSeen = payment.timestamp;
                    // Also update email if it was missing before
                    if (!existingUser.email || existingUser.email === 'not-provided') {
                        existingUser.email = payment.userEmail;
                    }
                }
            }
        }
        const users = Array.from(userMap.values());
        users.sort((a,b) => new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime());
        return JSON.parse(JSON.stringify(users));
    },
    ['users'],
    {
        tags: ['users']
    }
);


export async function approvePayment(transactionId: string) {
    console.log("Approving payment for transaction:", transactionId);
    const payment = payments.find(p => p.transactionId === transactionId);
    if (payment) {
        payment.status = 'approved';
        // The timestamp is now the approval time
        payment.timestamp = new Date();
        console.log("Payment approved:", payment);
    } else {
        console.error("Payment not found for approval:", transactionId);
        throw new Error("Payment not found");
    }
     // Revalidate the cache for payments and users
    revalidateTag('payments');
    revalidateTag('users');
    return { success: true };
}

export async function getPremiumStatus(data: { username: string, templateId: Template }): Promise<{ isUnlocked: boolean, pendingUntil?: number }> {
    const { username, templateId } = data;
    
    // If there is no username, the user isn't logged in, so nothing can be unlocked.
    if (!username) {
        return { isUnlocked: false };
    }
    
    const allUserPayments = payments.filter(p => p.username === username);
    const now = new Date().getTime();

    // 1. Check for an active APPROVED payment for the specific template
    const approvedPayment = allUserPayments.find(p =>
        p.templateId === templateId &&
        p.status === 'approved' &&
        (now - new Date(p.timestamp).getTime()) / (1000 * 60 * 60) <= 24 // Check if within 24 hours
    );

    if (approvedPayment) {
        return { isUnlocked: true };
    }

    // 2. If not approved, check for a recent PENDING payment for that template
    const pendingPayment = allUserPayments.find(p =>
        p.templateId === templateId &&
        p.status === 'pending'
    );
    
    if(pendingPayment) {
        const submissionTime = new Date(pendingPayment.timestamp).getTime();
        const timeDifference = now - submissionTime;
        const minutesDifference = timeDifference / (1000 * 60);

        // If payment is pending and submitted within the last 5 minutes
        if (minutesDifference <= 5) {
            const pendingUntil = submissionTime + (5 * 60 * 1000); // 5 minutes from submission time
            return { isUnlocked: false, pendingUntil };
        }
    }
    
    // 3. If no approved or recent pending payment is found
    return { isUnlocked: false };
}


export async function adminLogin({ email, password }: {email: string, password: string}) {
    // In a real app, use a secure, hashed password comparison
    const isAdmin = email === "rajahuzaifa015166@gmail.com" && password === "Huzaifa112233";
    return { success: isAdmin };
}
