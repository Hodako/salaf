'use client';

import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { StoreProvider } from "@/store/StoreProvider";

/**
 * A composite provider component that wraps the application in all necessary 
 * client-side context providers, including Redux, React Query, and Toaster.
 * Also registers the custom Service Worker for image/asset pre-caching.
 * 
 * @param props - The component props containing the child content.
 */
export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            // Register service worker after hydration
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Salaf Service Worker registered successfully with scope:', registration.scope);
                })
                .catch((error) => {
                    console.error('Salaf Service Worker registration failed:', error);
                });
        }
    }, []);

    return (
        <StoreProvider>
            <QueryProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    forcedTheme="light"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    <Toaster position="top-right" richColors />
                    <TooltipProvider>
                        {children}
                    </TooltipProvider>
                </ThemeProvider>
            </QueryProvider>
        </StoreProvider>
    );
}