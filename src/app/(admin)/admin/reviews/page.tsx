"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
    Star,
    Trash2,
    CheckCircle,
    XCircle,
    Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function InternalReviewsPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");
    const limit = 10;

    const { data: reviewsData, isLoading } = useQuery({
        queryKey: ["admin-internal-reviews", page, statusFilter],
        queryFn: async () => {
            const { data } = await axios.get(`/admin/reviews?page=${page}&limit=${limit}&status=${statusFilter}`);
            return data;
        }
    });

    const reviews = reviewsData?.reviews || [];
    const totalPages = reviewsData?.totalPages || 0;

    const toggleApproveMutation = useMutation({
        mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) => 
            axios.patch(`/admin/reviews/${id}`, { isApproved }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-internal-reviews"] });
            toast.success("Review status updated");
        },
        onError: () => toast.error("Failed to update status")
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => axios.delete(`/admin/reviews/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-internal-reviews"] });
            toast.success("Review deleted permanently");
        },
        onError: () => toast.error("Failed to delete review")
    });

    const handleToggleApprove = (review: any) => {
        toggleApproveMutation.mutate({ id: review._id, isApproved: !review.isApproved });
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this review permanently? This action cannot be undone.")) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-heading font-medium text-white mb-2">
                        Product <span className="text-bprimary">Reviews</span>
                    </h1>
                    <p className="text-gray-500 italic">Manage customer feedback and moderate submissions for quality.</p>
                </div>
                
                {/* Status Filter */}
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                    {["all", "pending", "approved"].map((s) => (
                        <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setPage(1); }}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                statusFilter === s 
                                    ? "bg-bprimary text-black" 
                                    : "text-gray-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </header>

            {/* Reviews List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-white/5 rounded-[3rem] border border-white/5 animate-pulse" />
                    ))
                ) : reviews.length === 0 ? (
                    <div className="col-span-full py-32 text-center text-gray-500 italic border border-white/5 border-dashed rounded-[3rem] bg-white/2">
                        No internal reviews found matching your criteria.
                    </div>
                ) : (
                    reviews.map((review: any) => (
                        <div key={review._id} className="bg-[#080808] rounded-[3.5rem] border border-white/5 p-10 flex flex-col group transition-all duration-500 hover:border-bprimary/30 hover:bg-white/3 hover:-translate-y-2 relative overflow-hidden">
                            {/* Status Indicator Bar */}
                            <div className={cn(
                                "absolute top-0 left-0 w-full h-1 transition-colors",
                                review.isApproved ? "bg-green-500/20" : "bg-red-500/20"
                            )} />

                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-bprimary/20 to-transparent flex items-center justify-center border border-bprimary/10 shadow-inner">
                                        <span className="text-bprimary font-black text-xl italic">{review.user?.charAt(0) || "A"}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-bold text-white italic">{review.user}</h4>
                                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">Verified Customer</span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleToggleApprove(review)} 
                                        disabled={toggleApproveMutation.isPending}
                                        className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300",
                                            review.isApproved 
                                                ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white" 
                                                : "bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white"
                                        )}
                                        title={review.isApproved ? "Unapprove" : "Approve"}
                                    >
                                        {review.isApproved ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(review._id)} 
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 text-gray-500 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all duration-300"
                                        title="Delete Permanently"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 mb-6">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={cn(
                                            "w-4 h-4 transition-colors",
                                            s <= review.rating ? "fill-bprimary text-bprimary" : "text-white/5"
                                        )}
                                    />
                                ))}
                            </div>

                            <p className="text-gray-400 text-base font-light italic leading-relaxed flex-1 mb-8">
                                "{review.comment}"
                            </p>

                            {/* Images Grid */}
                            {review.images && review.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    {review.images.map((img: string, idx: number) => (
                                        <div key={idx} className="relative aspect-square rounded-[1.5rem] overflow-hidden border border-white/10 group/img">
                                            <img src={img} alt="Customer upload" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-bprimary/10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="mt-auto pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{format(new Date(review.createdAt), "MMMM dd, yyyy")}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge className={cn(
                                            "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                            review.isApproved ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                                        )}>
                                            {review.isApproved ? "Approved" : "Pending moderation"}
                                        </Badge>
                                    </div>
                                </div>
                                
                                {review.product && (
                                    <div className="flex items-center gap-3 py-2 px-4 bg-white/2 rounded-2xl border border-white/5 max-w-[200px]">
                                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                                            <img src={review.product.featuredImage} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-[10px] text-white font-bold truncate">{review.product.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-10">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="bg-white/5 border-white/10 rounded-2xl h-14 px-8 hover:bg-white/10 disabled:opacity-30 transition-all"
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={cn(
                                    "w-14 h-14 rounded-2xl text-sm font-black transition-all",
                                    page === i + 1 
                                        ? "bg-bprimary text-black shadow-xl shadow-bprimary/20" 
                                        : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
                                )}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="bg-white/5 border-white/10 rounded-2xl h-14 px-8 hover:bg-white/10 disabled:opacity-30 transition-all"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
