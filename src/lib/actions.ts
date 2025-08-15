'use server';

import { cvEnhancementTool, type CvEnhancementToolInput } from "@/ai/flows/cv-enhancement-tool";
import type { Payment, Template, User } from './types';

// Mock database
const payments: Payment[] = [];

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
    // Avoid duplicate pending payments
    if (!payments.some(p => p.transactionId === data.transactionId)) {
       payments.push({ ...data, status: 'pending', timestamp: new Date() });
    }
    return { success: true };
}

export async function getPayments(): Promise<Payment[]> {
    // In a real app, you'd fetch this from a database
    // Return a copy to avoid mutation
    const sortedPayments = payments.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
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
            if (payment.timestamp < existingUser.firstSeen) {
                existingUser.firstSeen = payment.timestamp;
                // Also update email if it was missing before
                if (!existingUser.email || existingUser.email === 'not-provided') {
                    existingUser.email = payment.userEmail;
                }
            }
        }
    }
    const users = Array.from(userMap.values());
    users.sort((a,b) => b.firstSeen.getTime() - a.firstSeen.getTime());
    return JSON.parse(JSON.stringify(users));
}

export async function approvePayment(transactionId: string) {
    console.log("Approving payment for transaction:", transactionId);
    const payment = payments.find(p => p.transactionId === transactionId);
    if (payment) {
        payment.status = 'approved';
        // The timestamp is now the approval time
        payment.timestamp = new Date();
    } else {
        throw new Error("Payment not found");
    }
    return { success: true };
}

export async function getPremiumStatus(data: { username: string, templateId: Template }): Promise<boolean> {
    const { username, templateId } = data;
    
    const relevantPayment = payments.find(p => 
        p.username === username && 
        p.templateId === templateId &&
        p.status === 'approved'
    );

    if (!relevantPayment) {
        return false;
    }

    // Check if the payment was approved within the last 24 hours
    const now = new Date();
    const approvalTime = new Date(relevantPayment.timestamp);
    const timeDifference = now.getTime() - approvalTime.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    return hoursDifference <= 24;
}

export async function adminLogin({ email, password }: {email: string, password: string}) {
    // In a real app, use a secure, hashed password comparison
    const isAdmin = email === "rajahuzaifa015166@gmail.com" && password === "@Huzaifa112233";
    return { success: isAdmin };
}
