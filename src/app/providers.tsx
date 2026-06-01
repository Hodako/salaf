'use client';

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { StoreProvider } from "@/store/StoreProvider";

/**
 * A composite provider component that wraps the application in all necessary 
 * client-side context providers, including Redux, React Query, and Toaster.
 * 
 * @param props - The component props containing the child content.
 */
export function Providers({ children }: { children: React.ReactNode }) {
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