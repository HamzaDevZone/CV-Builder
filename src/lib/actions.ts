
'use server';

import { cvEnhancementTool, type CvEnhancementToolInput } from "@/ai/flows/cv-enhancement-tool";
import type { Payment, Template, User, Ad } from './types';
import { unstable_cache as cache, revalidateTag } from 'next/cache';
import { templateTiers } from "@/lib/template-tiers";

// Mock database - This is a simple in-memory store.
// In a real production app, you would use a persistent database like Firestore.
// We make it a global to ensure it persists across server action calls in a development environment.
if (!global.payments) {
  global.payments = [];
}
const payments: Payment[] = global.payments;

if (!global.ads) {
  global.ads = [];
}
const ads: Ad[] = global.ads;


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
        const sortedPayments = [...payments].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return sortedPayments;
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
        return users;
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
        // The timestamp is now the approval time, not submission time
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

    if (!username) {
        return { isUnlocked: false };
    }

    const allUserPayments = payments.filter(p => p.username === username);
    const now = Date.now();

    // Find the tier of the requested template
    const requestedTier = templateTiers.find(tier => tier.templates.some(t => t.id === templateId));
    if (!requestedTier || requestedTier.price === undefined) {
        // This handles free templates or templates not found in tiers
        return { isUnlocked: true };
    }
    
    const templatesInTier = requestedTier.templates.map(t => t.id);

    // 1. Check for an active APPROVED payment for ANY template in the same tier
    const approvedPayment = allUserPayments.find(p =>
        templatesInTier.includes(p.templateId) &&
        p.status === 'approved' &&
        (now - new Date(p.timestamp).getTime()) / (1000 * 60 * 60) <= 24 // Check if within 24 hours
    );

    if (approvedPayment) {
        return { isUnlocked: true };
    }

    // 2. If not approved, check for a recent PENDING payment for the specific template
    // We only show pending for the specific template being clicked, not the whole tier.
    const pendingPayment = allUserPayments
        .filter(p => p.templateId === templateId && p.status === 'pending')
        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]; // Get the most recent one

    if (pendingPayment) {
        const submissionTime = new Date(pendingPayment.timestamp).getTime();
        const timeSinceSubmission = now - submissionTime;

        // If payment is pending and submitted within the last 5 minutes
        if (timeSinceSubmission <= 5 * 60 * 1000) {
            const pendingUntil = submissionTime + (5 * 60 * 1000);
            return { isUnlocked: false, pendingUntil };
        }
    }

    return { isUnlocked: false };
}


export async function adminLogin({ email, password }: {email: string, password: string}) {
    // In a real app, use a secure, hashed password comparison
    const isAdmin = email === "admin@gmail.com" && password === "005367";
    return { success: isAdmin };
}

// --- Ad Management Actions ---

export const getAds = cache(
    async (): Promise<Ad[]> => {
        return [...ads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    ['ads'],
    {
        tags: ['ads'],
    }
);

export async function createAd(data: { brandName: string; offer: string; linkUrl: string; imageUrl: string; }) {
    const newAd: Ad = {
        id: crypto.randomUUID(),
        brandName: data.brandName,
        offer: data.offer,
        linkUrl: data.linkUrl,
        imageUrl: data.imageUrl,
        createdAt: new Date(),
    };
    ads.unshift(newAd); // Add to the beginning of the array
    revalidateTag('ads');
    return { success: true, ad: newAd };
}

export async function deleteAd(adId: string) {
    const index = ads.findIndex(ad => ad.id === adId);
    if (index > -1) {
        ads.splice(index, 1);
        revalidateTag('ads');
        return { success: true };
    }
    return { success: false, message: 'Ad not found' };
}
