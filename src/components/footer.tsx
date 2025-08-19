
'use client';

import Link from "next/link";
import { QuickCvIcon } from "./icons";

export function Footer() {
    return (
        <footer className="border-t bg-secondary/50">
            <div className="container py-8 text-center text-muted-foreground">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                    <div className="flex items-center gap-2 mb-4 sm:mb-0">
                        <QuickCvIcon className="h-6 w-6 text-primary" />
                        <span className="font-bold text-lg">Quick CV Maker</span>
                    </div>
                    <p className="text-sm">
                        Developed with ❤️ by <Link href="https://github.com/huzaifa-raja" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Huzaifa</Link>.
                    </p>
                </div>
            </div>
        </footer>
    );
}
