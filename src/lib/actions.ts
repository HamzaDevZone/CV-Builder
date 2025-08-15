'use server';

import { cvEnhancementTool, type CvEnhancementToolInput } from "@/ai/flows/cv-enhancement-tool";

// Mock database
interface Payment {
    userId: string;
    userEmail: string;
    transactionId: string;
    status: 'pending' | 'approved';
    timestamp: Date;
}
const payments: Payment[] = [];

// This would be a real database in a production app
const premiumUsers = new Set<string>();

export async function enhanceCv(input: CvEnhancementToolInput): Promise<string> {
    try {
        const result = await cvEnhancementTool(input);
        return result.feedback;
    } catch (error) {
        console.error("Error enhancing CV:", error);
        throw new Error("Failed to get AI feedback.");
    }
}

export async function submitPayment(data: { userId: string; transactionId: string, userEmail: string; }) {
    console.log("Submitting payment for user:", data.userId);
    // Avoid duplicate pending payments
    if (!payments.some(p => p.userId === data.userId && p.status === 'pending')) {
       payments.push({ ...data, status: 'pending', timestamp: new Date() });
    }
    return { success: true };
}

export async function getPayments() {
    // In a real app, you'd fetch this from a database
    // Return a copy to avoid mutation
    return JSON.parse(JSON.stringify(payments.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())));
}

export async function approvePayment(userId: string) {
    console.log("Approving payment for user:", userId);
    const payment = payments.find(p => p.userId === userId);
    if (payment) {
        payment.status = 'approved';
        premiumUsers.add(userId);
    }
    return { success: true };
}

export async function getPremiumStatus(userId: string): Promise<boolean> {
    return premiumUsers.has(userId);
}

export async function adminLogin({ email, password }: {email: string, password: string}) {
    // In a real app, use a secure, hashed password comparison
    const isAdmin = email === "rajahuzaifa015166@gmail.com" && password === "@Huzaifa112233";
    return { success: isAdmin };
}
