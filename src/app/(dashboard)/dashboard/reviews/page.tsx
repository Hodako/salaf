"use client";

import React from "react";
import { MessageSquare, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { Loader2 } from "lucide-react";

export default function ReviewsPage() {
    const { data: reviews = [], isLoading } = useQuery({
        queryKey: ["my-reviews"],
        queryFn: async () => {
            const { data } = await axios.get("/reviews/me");
            return data;
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-bprimary animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-4xl md:text-5xl font-heading font-medium text-white italic">
                    My <span className="text-bprimary">Reviews</span>
                </h1>
                <p className="text-gray-500 mt-4 leading-relaxed">Sharing your olfactory journey with the community.</p>
            </header>

            {reviews.length === 0 ? (
                <div className="bg-white/5 border border-white/5 rounded-[3rem] p-16 text-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 rounded-full bg-bprimary/10 flex items-center justify-center mx-auto mb-8 border border-bprimary/20">
                        <MessageSquare className="w-10 h-10 text-bprimary opacity-40" />
                    </div>
                    <h2 className="text-2xl text-white font-medium mb-4">No reviews yet</h2>
                    <p className="text-gray-500 mb-10 leading-relaxed">Your voice matters. Share your thoughts on your recent acquisitions and help others find their signature scent.</p>
                    <Link href="/dashboard">
                        <Button className="h-14 bg-white text-black font-bold uppercase tracking-widest rounded-2xl px-12 hover:bg-bprimary transition-colors group">
                            Review an Acquisition
                            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {/* Review list would go here */}
                </div>
            )}
        </div>
    );
}
