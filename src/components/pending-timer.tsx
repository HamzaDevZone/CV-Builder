
'use client'

import { useCvContext } from "@/context/cv-context";
import { useEffect, useState } from "react";

export const PendingTimer = ({ expiryTimestamp }: { expiryTimestamp: number }) => {
    const { refreshStatus } = useCvContext();
    const [timeLeft, setTimeLeft] = useState(expiryTimestamp - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            const newTimeLeft = expiryTimestamp - Date.now();
            if (newTimeLeft <= 0) {
                clearInterval(interval);
                refreshStatus(); // re-check status when timer ends
            }
            setTimeLeft(newTimeLeft);
        }, 1000);

        return () => clearInterval(interval);
    }, [expiryTimestamp, refreshStatus]);

    if (timeLeft <= 0) {
        return null;
    }
    
    const minutes = Math.floor((timeLeft / 1000) / 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);

    return (
        <span className="ml-1 font-mono">({`${minutes}:${seconds.toString().padStart(2, '0')}`})</span>
    )
}
