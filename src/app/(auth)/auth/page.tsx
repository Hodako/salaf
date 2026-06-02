"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is installed from your shadcn setup
import { logLogin, logSignUp } from "@/lib/gtm";

import { Suspense } from "react";

function AuthPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    const returnUrl = searchParams.get('returnUrl') || searchParams.get('redirect') || '/dashboard';

    const handleGoogleSignIn = () => {
        setIsLoading(true);
        toast.info("Redirecting to Google...");
        window.location.href = "/api/auth/google";
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden text-foreground">

            {/* Subtle background flair */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-bprimary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-bprimary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="z-10 w-full max-w-md p-8 md:p-12 flex flex-col items-center border border-border rounded-2xl bg-card shadow-2xl mx-4">

                {/* Branding */}
                <h1 className="text-3xl font-heading font-medium tracking-wider mb-2 text-center text-foreground">
                    Welcome to Salaf
                </h1>
                <p className="text-muted-foreground text-sm tracking-wide font-light text-center mb-10">
                    Sign in to access your curated collection and premium services.
                </p>

                {/* Auth Actions */}
                <Button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full h-12 bg-white hover:bg-slate-50 text-black font-semibold rounded-md transition-all flex items-center justify-center gap-3 group border border-border/50 hover:border-border"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {/* Simple Google SVG Icon */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span>Continue with Google</span>
                        </>
                    )}
                </Button>

                <div className="mt-8 text-xs text-muted-foreground text-center font-light leading-relaxed">
                    By confirming, you agree to our <span className="underline cursor-pointer hover:text-foreground transition-colors">Terms of Service</span> and <span className="underline cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span>.
                </div>
            </div>
        </main>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-foreground animate-spin opacity-20" />
            </div>
        }>
            <AuthPageContent />
        </Suspense>
    );
}
