'use server';

import { cvEnhancementTool, type CvEnhancementToolInput } from "@/ai/flows/cv-enhancement-tool";
import type { Payment, Template, User } from './types';

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
    if (!existingPayment) {
       payments.push({ ...data, status: 'pending', timestamp: new Date() });
    }
    console.log("Current payments count:", payments.length);
    return { success: true };
}

export async function getPayments(): Promise<Payment[]> {
    // In a real app, you'd fetch this from a database
    // Return a deep copy to avoid mutation and ensure serializability
    const sortedPayments = [...payments].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return JSON.parse(JSON.stringify(sortedPayments));
}

export async function getUsers(): Promise<User[]> {
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
}

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
    return { success: true };
}

export async function getPremiumStatus(data: { username: string, templateId: Template }): Promise<boolean> {
    const { username, templateId } = data;
    
    // Find all approved payments for this user and template
    const approvedPayments = payments.filter(p => 
        p.username === username && 
        p.templateId === templateId &&
        p.status === 'approved'
    );

    if (approvedPayments.length === 0) {
        return false;
    }

    // Check if any of the approved payments are within the last 24 hours
    const now = new Date();
    const hasValidPayment = approvedPayments.some(payment => {
        const approvalTime = new Date(payment.timestamp);
        const timeDifference = now.getTime() - approvalTime.getTime();
        const hoursDifference = timeDifference / (1000 * 60 * 60);
        return hoursDifference <= 24;
    });

    return hasValidPayment;
}

export async function adminLogin({ email, password }: {email: string, password: string}) {
    // In a real app, use a secure, hashed password comparison
    const isAdmin = email === "rajahuzaifa015166@gmail.com" && password === "Huzaifa112233";
    return { success: isAdmin };
}
