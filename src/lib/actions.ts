'use server';

import { cvEnhancementTool, type CvEnhancementToolInput } from "@/ai/flows/cv-enhancement-tool";
import type { Payment, Template } from './types';

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

export async function submitPayment(data: { userId: string; transactionId: string, userEmail: string; templateId: Template }) {
    console.log("Submitting payment for user:", data.userId, "for template", data.templateId, "with email", data.userEmail);
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

export async function getPremiumStatus(data: { userId: string, templateId: Template }): Promise<boolean> {
    const { userId, templateId } = data;
    
    const relevantPayment = payments.find(p => 
        p.userId === userId && 
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
