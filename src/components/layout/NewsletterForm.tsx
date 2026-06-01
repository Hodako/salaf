"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!email) {
            toast.error("Please enter an email address");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || "Thank you for subscribing!");
                setEmail("");
            } else {
                toast.error(data.message || "Subscription failed");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center w-full max-w-sm mt-1 gap-3 sm:gap-0">
            <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-bprimary focus-visible:border-bprimary rounded-full sm:rounded-r-none h-12"
            />
            <Button 
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#C5A028] text-white rounded-full sm:rounded-l-none h-12 px-8 font-bold transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] border-none shrink-0"
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Subscribe
            </Button>
        </div>
    );
}
