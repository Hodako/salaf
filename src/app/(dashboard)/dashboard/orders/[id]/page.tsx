"use client";

import React, { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { 
    Package, 
    Truck, 
    CheckCircle2, 
    Clock, 
    MapPin, 
    ChevronLeft,
    Loader2,
    ShoppingBag,
    Phone,
    Star,
    Camera,
    X
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

function ReviewModal({ product, productName }: { product: string, productName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("file", files[i]);
        }

        try {
            const { data } = await axios.post("/admin/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setImages(prev => [...prev, ...data.urls].slice(0, 3));
        } catch (error) {
            toast.error("Visions failed to upload");
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post("/reviews", { product, rating, comment, images });
            toast.success("Thank you for your elegant review!");
            setIsOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-[#c06b40] hover:text-foreground hover:bg-[#c06b40]/10 rounded-xl px-6">
                    Review This Product
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground rounded-[2rem] max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-heading font-medium">
                        Share Your <span className="text-bprimary italic">Experience</span>
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground font-light mt-2 italic px-2">How was your journey with {productName}?</p>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-8 py-6">
                    <div className="flex flex-col items-center gap-4 py-4 bg-muted/30 rounded-[2rem] border border-border">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button 
                                    key={s} 
                                    type="button"
                                    onClick={() => setRating(s)}
                                    className="p-1 transition-transform active:scale-90"
                                >
                                    <Star 
                                        className={cn(
                                            "w-8 h-8 transition-colors duration-300",
                                            s <= rating ? "fill-bprimary text-bprimary" : "text-foreground/10"
                                        )} 
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                            {rating === 5 ? "Exquisite" : rating === 4 ? "Splendid" : rating === 3 ? "Admirable" : rating === 2 ? "Modest" : "Unbecoming"}
                        </span>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Detailed Testimonial</label>
                        <Textarea 
                            required
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about the scent, longevity, and your overall impressions..."
                            className="bg-muted/50 border-border rounded-2xl min-h-[140px] focus:border-bprimary/40 focus:ring-0 transition-all font-light italic"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Visual Documentation (Limit 3)</label>
                        <div className="grid grid-cols-4 gap-4 px-2">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative group/img aspect-square rounded-xl overflow-hidden border border-border">
                                    <Image src={img} alt="" fill className="object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-foreground opacity-0 group-hover/img:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {images.length < 3 && (
                                <label className="aspect-square rounded-xl border border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-bprimary/40 hover:bg-muted/30 transition-all group/upload">
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                    />
                                    {isUploading ? (
                                        <Loader2 className="w-5 h-5 text-bprimary animate-spin" />
                                    ) : (
                                        <>
                                            <Camera className="w-5 h-5 text-muted-foreground group-hover/upload:text-bprimary transition-colors" />
                                            <span className="text-[8px] font-bold text-muted-foreground mt-2 uppercase">Add Media</span>
                                        </>
                                    )}
                                </label>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full h-14 bg-bprimary text-background font-bold uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform shadow-2xl shadow-bprimary/20"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Commit Testimonial"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

const statusColors: any = {
    Pending: "bg-yellow-500/10 text-yellow-500",
    Processing: "bg-blue-500/10 text-blue-500",
    Shipped: "bg-purple-500/10 text-purple-500",
    Delivered: "bg-green-500/10 text-green-500",
    Cancelled: "bg-red-500/10 text-red-500",
};

const statusIcons: any = {
    Pending: <Clock className="w-5 h-5" />,
    Processing: <Package className="w-5 h-5" />,
    Shipped: <Truck className="w-5 h-5" />,
    Delivered: <CheckCircle2 className="w-5 h-5" />,
    Cancelled: <CheckCircle2 className="w-5 h-5 opacity-20" />,
};

export default function UserOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const { data: order, isLoading } = useQuery({
        queryKey: ["order", id],
        queryFn: async () => {
            const { data } = await axios.get(`/orders/${id}`);
            return data;
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-bprimary animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="text-center space-y-6">
                    <ShoppingBag className="w-16 h-16 text-foreground opacity-10 mx-auto" />
                    <h2 className="text-2xl text-foreground font-medium">Acquisition Not Found</h2>
                    <Link href="/dashboard">
                        <Button className="bg-bprimary text-background font-bold uppercase tracking-widest rounded-2xl px-12 h-14">
                            Return to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-12 font-lato">
            <div className="max-w-5xl mx-auto space-y-12">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-4">
                        <Link href="/dashboard" className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Dashboard Portfolio</span>
                        </Link>
                        <h1 className="text-4xl font-heading font-medium text-foreground tracking-tight">
                            Acquisition <span className="text-bprimary font-mono lowercase">#{order._id.slice(-8).toUpperCase()}</span>
                        </h1>
                    </div>
                    <Badge className={`${statusColors[order.status]} border-none rounded-full px-8 py-3 text-xs font-bold uppercase tracking-widest shadow-2xl`}>
                        {statusIcons[order.status]}
                        <span className="ml-2">{order.status}</span>
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Order Information */}
                    <div className="lg:col-span-8 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        
                        {/* Status Timeline - Simplified for User */}
                        <div className="bg-muted/40 rounded-[3rem] p-10 border border-border relative overflow-hidden group">
                           <div className="flex items-center gap-6 mb-10">
                               <div className="w-14 h-14 rounded-2xl bg-bprimary/10 border border-bprimary/20 flex items-center justify-center text-bprimary shadow-inner">
                                   <Package className="w-6 h-6" />
                               </div>
                               <div>
                                   <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Fulfillment Status</p>
                                   <h3 className="text-xl text-foreground font-medium">Your acquisition is {order.status.toLowerCase()}</h3>
                               </div>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="space-y-1">
                                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Authorized Date</p>
                                   <p className="text-gray-300 font-medium">{format(new Date(order.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}</p>
                               </div>
                               {order.status !== 'Pending' && (
                                   <div className="space-y-1">
                                       <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Last Activity</p>
                                       <p className="text-gray-300 font-medium">{format(new Date(order.updatedAt), "MMMM dd, yyyy 'at' hh:mm a")}</p>
                                   </div>
                               )}
                           </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-heading font-medium text-foreground px-4">Gallery Items</h2>
                            <div className="grid gap-6">
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="bg-muted/30 rounded-[2.5rem] border border-border p-6 group transition-all hover:bg-muted/40 hover:border-bprimary/20">
                                        <div className="flex gap-6 items-center">
                                            <div className="w-24 h-24 rounded-2xl bg-muted/50 border border-border overflow-hidden relative shadow-inner">
                                                <Image src={item.featuredImage} alt={item.productName} fill className="object-cover p-3 grayscale group-hover:grayscale-0 transition-all duration-700" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <h4 className="text-foreground font-medium group-hover:text-bprimary transition-colors">{item.productName}</h4>
                                                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    <span>{item.volume} {item.variantType ? `(${item.variantType})` : ""}</span>
                                                    <span className="w-1 h-1 rounded-full bg-foreground/10" />
                                                    <span>Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-medium text-foreground">৳{(item.price * item.quantity).toLocaleString()}</p>
                                                <p className="text-[10px] text-muted-foreground font-mono">৳{item.price.toLocaleString()} ea.</p>
                                            </div>
                                        </div>
                                        {order.status === 'Delivered' && (
                                            <div className="mt-6 pt-6 border-t border-border flex justify-end">
                                                <ReviewModal product={item.product} productName={item.productName} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Logistics & Financials */}
                    <div className="lg:col-span-4 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        {/* Logistics */}
                        <div className="bg-muted/40 rounded-[3rem] p-10 border border-border space-y-8">
                            <div>
                                <h3 className="text-lg font-heading font-medium text-foreground mb-6 flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-bprimary" />
                                    Fulfillment Details
                                </h3>
                                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed font-light">
                                    <div className="space-y-0.5">
                                        <p className="text-foreground font-medium">{order.user?.name || "Customer"}</p>
                                        <p>{order.shippingAddress.streetAddress}</p>
                                        <p>{order.shippingAddress.upazila}, {order.shippingAddress.district}</p>
                                        <p>{order.shippingAddress.division} - {order.shippingAddress.postCode}</p>
                                    </div>
                                    <div className="pt-4 flex items-center gap-3 text-bprimary text-[10px] font-bold uppercase tracking-widest">
                                        <Phone className="w-4 h-4" />
                                        {order.phoneNumber || order.user?.phoneNumber}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-border space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground font-medium italic">Portfolio Value</span>
                                    <span className="text-foreground font-medium font-mono">৳{order.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground font-medium italic">Fulfillment Fee</span>
                                    <span className="text-foreground font-medium font-mono">৳{order.shippingFee.toLocaleString()}</span>
                                </div>
                                {order.couponCode && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-emerald-500 font-medium italic">Discount ({order.couponCode})</span>
                                        <span className="text-emerald-500 font-medium font-mono">- ৳{order.discountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="pt-4 flex justify-between items-end border-t border-border">
                                    <div>
                                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Total Investment</p>
                                        <p className="text-3xl font-medium text-bprimary tracking-tighter">৳{order.totalAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="bg-bprimary/10 border border-bprimary/20 rounded-[3rem] p-10 text-center relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-muted/50 blur-[50px] -mr-16 -mt-16" />
                           <p className="text-[10px] text-bprimary font-black uppercase tracking-[0.3em] mb-4">Concierge Support</p>
                           <p className="text-muted-foreground text-sm font-light mb-8 leading-relaxed italic">Our fragrance consultants are standing by to assist with your acquisition.</p>
                           <Button className="w-full h-14 bg-foreground text-background font-bold uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform shadow-xl">
                               Contact Concierge
                           </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
