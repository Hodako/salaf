"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
    Star,
    Plus,
    Trash2,
    Edit2,
    ExternalLink,
    Loader2,
    Image as ImageIcon,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ImgBBUploader } from "@/components/admin/products/ImgBBUploader";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ExternalReviewsPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<any>(null);
    const [formData, setFormData] = useState({
        reviewerName: "",
        content: "",
        rating: 5,
        images: [] as string[],
        source: "FACEBOOK",
        link: "",
        date: new Date().toISOString().split('T')[0],
        product: "",
    });

    const { data: products = [] } = useQuery({
        queryKey: ["admin-products"],
        queryFn: async () => {
            const { data } = await axios.get("/admin/products");
            return data;
        }
    });

    const [page, setPage] = useState(1);
    const limit = 12;

    const { data: reviewsData, isLoading } = useQuery({
        queryKey: ["admin-external-reviews", page],
        queryFn: async () => {
            const { data } = await axios.get(`/admin/external-reviews?page=${page}&limit=${limit}`);
            return data;
        }
    });

    const reviews = reviewsData?.reviews || [];
    const totalPages = reviewsData?.totalPages || 0;

    const createMutation = useMutation({
        mutationFn: (data: any) => axios.post("/admin/external-reviews", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-external-reviews"] });
            toast.success("Review added successfully");
            handleCloseModal();
        },
        onError: (err: any) => toast.error(err.response?.data?.error || "Failed to add review")
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => axios.patch(`/admin/external-reviews/${editingReview._id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-external-reviews"] });
            toast.success("Review updated successfully");
            handleCloseModal();
        },
        onError: (err: any) => toast.error(err.response?.data?.error || "Failed to update review")
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => axios.delete(`/admin/external-reviews/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-external-reviews"] });
            toast.success("Review deleted");
        }
    });

    const handleOpenModal = (review?: any) => {
        if (review) {
            setEditingReview(review);
            setFormData({
                reviewerName: review.reviewerName,
                content: review.content,
                rating: review.rating,
                images: review.images || (review.image ? [review.image] : []),
                source: review.source || "FACEBOOK",
                link: review.link || "",
                date: review.date ? new Date(review.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                product: review.product || "",
            });
        } else {
            setEditingReview(null);
            setFormData({
                reviewerName: "",
                content: "",
                rating: 5,
                images: [],
                source: "FACEBOOK",
                link: "",
                date: new Date().toISOString().split('T')[0],
                product: "",
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingReview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingReview) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-heading font-medium text-white mb-2">
                        External <span className="text-bprimary">Reviews</span>
                    </h1>
                    <p className="text-gray-500">Manually add and manage reviews from social media and other platforms.</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className="bg-bprimary text-black font-bold uppercase tracking-widest rounded-2xl px-8 h-12 hover:scale-105 transition-transform"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Entry
                </Button>
            </header>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-white/5 rounded-[2rem] border border-white/5 animate-pulse" />
                    ))
                ) : reviews.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-500 italic border border-white/5 rounded-[2rem] bg-white/2">
                        No external reviews found.
                    </div>
                ) : (
                    reviews.map((review: any) => (
                        <div key={review._id} className="bg-white/3 rounded-[2rem] border border-white/5 p-8 flex flex-col group transition-all hover:bg-white/5 hover:border-bprimary/20">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-bprimary/20 to-transparent flex items-center justify-center border border-bprimary/10 overflow-hidden">
                                        <span className="text-bprimary font-bold">{review.reviewerName.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">{review.reviewerName}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">{review.source}</span>
                                            {review.link && (
                                                <a
                                                    href={review.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-bprimary hover:text-white transition-colors"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleOpenModal(review)} className="p-2 text-gray-500 hover:text-white transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => deleteMutation.mutate(review._id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={`w-3 h-3 ${s <= review.rating ? "fill-bprimary text-bprimary" : "text-gray-700"}`}
                                    />
                                ))}
                            </div>

                            <p className="text-gray-400 text-sm font-light leading-relaxed flex-1 italic">
                                "{review.content}"
                            </p>

                            {(review.images?.length > 0 || review.image) && (
                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    {(review.images || [review.image]).filter(Boolean).map((img: string, idx: number) => (
                                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group/img">
                                            <img src={img} alt="Review attachment" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/20 group-hover/img:bg-transparent transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {review.product && (
                                <div className="mt-4 flex items-center gap-2">
                                    <Badge variant="outline" className="bg-white/5 border-white/10 text-[9px] uppercase tracking-tighter">
                                        Product: {products.find((p: any) => p._id === review.product)?.name || "Linked Product"}
                                    </Badge>
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-none">
                                        {(() => {
                                            const d = new Date(review.date || review.createdAt);
                                            const day = d.getDate();
                                            const suffix = ["th", "st", "nd", "rd"][(day % 10 > 3 || [11, 12, 13].includes(day % 100)) ? 0 : day % 10];
                                            return `${day}${suffix} ${format(d, "MMM yyyy")}`;
                                        })()}
                                    </span>
                                    {review.link && (
                                        <Link
                                            href={review.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-bprimary hover:text-white font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 mt-2 group/link"
                                        >
                                            Show Actual Review
                                            <ExternalLink className="w-2.5 h-2.5 group-hover/link:translate-x-0.5 transition-transform" />
                                        </Link>
                                    )}
                                </div>
                                <Badge className={review.isApproved ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                                    {review.isApproved ? "Live" : "Paused"}
                                </Badge>
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
                        className="bg-white/5 border-white/10 rounded-xl h-12 px-6 hover:bg-white/10 disabled:opacity-30"
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={cn(
                                    "w-12 h-12 rounded-xl text-sm font-bold transition-all",
                                    page === i + 1 
                                        ? "bg-bprimary text-black" 
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
                        className="bg-white/5 border-white/10 rounded-xl h-12 px-6 hover:bg-white/10 disabled:opacity-30"
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#0a0a0a] border-white/10 text-white rounded-[2rem] max-w-2xl w-[95vw] p-0 overflow-hidden">
                    <DialogHeader className="p-8 pb-0">
                        <DialogTitle className="text-3xl font-heading font-medium tracking-tight">
                            {editingReview ? "Refine" : "New"} <span className="text-bprimary">Review</span>
                        </DialogTitle>
                        <p className="text-gray-500 text-sm mt-1">Capture the essence of client feedback from external platforms.</p>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh]">
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            {/* Reviewer Information */}
                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-bprimary/60 mb-2">Reviewer Identity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Full Name</label>
                                        <Input
                                            required
                                            value={formData.reviewerName}
                                            onChange={(e) => setFormData({ ...formData, reviewerName: e.target.value })}
                                            className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-bprimary/50 text-base"
                                            placeholder="e.g. Alex Siam"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Source Platform</label>
                                        <Select
                                            value={formData.source}
                                            onValueChange={(val: any) => setFormData({ ...formData, source: val })}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-0 focus:ring-offset-0 text-base">
                                                <SelectValue placeholder="Social" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0a0a0a] border-white/10 text-white rounded-xl">
                                                <SelectItem value="FACEBOOK">Facebook</SelectItem>
                                                <SelectItem value="GOOGLE">Google</SelectItem>
                                                <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                                                <SelectItem value="OTHERS">Others</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </section>

                            {/* Verification & Metadata */}
                            <section className="space-y-6 pt-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-bprimary/60 mb-2">Verification & Timing</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Review Date</label>
                                        <Input
                                            type="date"
                                            max={new Date().toISOString().split('T')[0]}
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-bprimary/50 text-white scheme-dark text-base"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Rating</label>
                                        <div className="flex items-center gap-2 h-14 bg-white/5 border border-white/10 rounded-2xl px-6">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, rating: star })}
                                                    className="transition-transform hover:scale-125 focus:outline-none"
                                                >
                                                    <Star
                                                        className={`w-6 h-6 transition-colors ${
                                                            star <= formData.rating ? "fill-bprimary text-bprimary" : "text-gray-700"
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Direct Link (Verification)</label>
                                    <Input
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        className="bg-white/5 border-white/10 h-14 rounded-2xl focus:border-bprimary/50 text-base"
                                        placeholder="https://facebook.com/reviews/..."
                                    />
                                </div>
                            </section>

                             {/* Linked Product */}
                             <section className="space-y-6 pt-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-bprimary/60 mb-2">Product Association</h3>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Select Product (Optional)</label>
                                    <Select
                                        value={formData.product}
                                        onValueChange={(val: any) => setFormData({ ...formData, product: val })}
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-0 focus:ring-offset-0 text-base">
                                            <SelectValue placeholder="No product linked" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0a0a0a] border-white/10 text-white rounded-xl max-h-60">
                                            <SelectItem value="none">No product linked</SelectItem>
                                            {products.map((p: any) => (
                                                <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </section>

                            {/* Content & Media */}
                            <section className="space-y-6 pt-4 pb-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-bprimary/60 mb-2">Content & Media</h3>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Testimonial Content</label>
                                    <Textarea
                                        required
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="bg-white/5 border-white/10 rounded-2xl focus:border-bprimary/50 min-h-[150px] p-6 text-base leading-relaxed"
                                        placeholder="Paste the client's feedback here..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Review Images</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <div className="bg-white/2 border border-white/10 rounded-2xl overflow-hidden aspect-square relative">
                                                    <img src={img} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                                                        className="absolute top-2 right-2 p-1 bg-red-500/20 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {formData.images.length < 5 && (
                                            <div className="bg-white/2 border border-dashed border-white/10 rounded-2xl p-4 hover:bg-white/5 transition-colors aspect-square flex items-center justify-center">
                                                <ImgBBUploader
                                                    value=""
                                                    onChange={(url) => setFormData({ ...formData, images: [...formData.images, url] })}
                                                    mini
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>

                        <DialogFooter className="p-8 bg-black/40 border-t border-white/5 backdrop-blur-xl flex items-center justify-between sm:justify-between">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-white hover:bg-white/5 h-14 px-8 rounded-2xl transition-all"
                            >
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="bg-white text-black font-bold uppercase tracking-widest rounded-2xl px-12 h-14 hover:bg-bprimary transition-all active:scale-95 shadow-2xl shadow-white/5"
                            >
                                {(createMutation.isPending || updateMutation.isPending) ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    editingReview ? "Update Entry" : "Commit Changes"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

