"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
    CheckCircle2, 
    ShoppingBag, 
    MapPin, 
    Phone, 
    Calendar, 
    ArrowRight, 
    Truck, 
    ChevronRight, 
    Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { motion } from "framer-motion";

export default function ThankYouPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const lastOrderStr = sessionStorage.getItem("lastOrder");
            if (lastOrderStr) {
                setOrder(JSON.parse(lastOrderStr));
            }
        } catch (e) {
            console.error("Error parsing last order", e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Clean up sessionStorage when leaving the page
    const handleHomeRedirect = () => {
        sessionStorage.removeItem("lastOrder");
        router.push("/");
    };

    const handleShopRedirect = () => {
        sessionStorage.removeItem("lastOrder");
        router.push("/shop");
    };

    const handleDashboardRedirect = () => {
        sessionStorage.removeItem("lastOrder");
        router.push(isAuthenticated ? "/dashboard" : "/auth");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-bprimary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                </div>
                <h1 className="text-2xl md:text-4xl font-heading font-medium text-foreground mb-3">No Order Found</h1>
                <p className="text-muted-foreground mb-8 max-w-sm text-sm">We couldn't retrieve your recent order. Let's head back to our fragrance catalog.</p>
                <Button 
                    onClick={handleShopRedirect}
                    className="bg-bprimary text-black font-bold px-10 rounded-full h-12 uppercase tracking-widest text-xs"
                >
                    Browse Fragrances
                </Button>
            </div>
        );
    }

    const {
        _id,
        items = [],
        shippingAddress = {},
        phoneNumber,
        name,
        subtotal,
        shippingFee,
        discountAmount,
        totalAmount,
        createdAt
    } = order;

    const formattedDate = createdAt 
        ? new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    return (
        <div className="min-h-screen bg-background pt-4 md:pt-28 pb-16 px-3 sm:px-6">
            <div className="container mx-auto max-w-4xl space-y-6 md:space-y-8">
                
                {/* Header Banner */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-muted/30 border border-border/40 rounded-3xl p-6 md:p-10 text-center relative overflow-hidden flex flex-col items-center justify-center shadow-xs"
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-bprimary/5 blur-[90px] rounded-full" />
                    
                    {/* Animated Golden Check Badge */}
                    <div className="relative mb-4 md:mb-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-bprimary/10 flex items-center justify-center border border-bprimary/30">
                            <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-bprimary-dark" />
                        </div>
                        <motion.div 
                            animate={{ scale: [1, 1.15, 1], rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                            className="absolute -top-1 -right-1 bg-[#fffbf0] border border-bprimary/20 w-6 h-6 rounded-full flex items-center justify-center shadow-xs"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-bprimary-dark" />
                        </motion.div>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-heading font-black text-gray-950 uppercase tracking-wide leading-tight">
                        Order <span className="text-bprimary-dark">Confirmed!</span>
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-base mt-2 max-w-lg leading-relaxed">
                        Thank you for choosing <span className="font-semibold text-foreground">Salaf - سلف</span>. Your luxury attar package is being prepared and will reach you soon.
                    </p>
                </motion.div>

                {/* Main Order Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
                    
                    {/* Left Panel: Summary & Items */}
                    <motion.div 
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="md:col-span-7 space-y-4 md:space-y-6"
                    >
                        {/* Order info details box */}
                        <div className="bg-white border border-border rounded-2xl md:rounded-[2rem] p-4 md:p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Order ID</p>
                                    <p className="text-xs md:text-sm font-mono font-bold text-foreground/90 select-all mt-0.5">#{_id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Order Date</p>
                                    <p className="text-xs md:text-sm font-bold text-foreground/90 mt-0.5">{formattedDate}</p>
                                </div>
                            </div>

                            {/* Delivery Time Marquee Card */}
                            <div className="bg-bprimary/5 border border-bprimary/15 rounded-xl p-3.5 flex items-center gap-3">
                                <Truck className="w-5 h-5 text-bprimary-dark shrink-0" />
                                <div className="text-left text-xs font-semibold leading-normal text-gray-950/80">
                                    Expected Delivery: <span className="text-bprimary-dark font-black">2 - 3 Business Days</span> (Nationwide)
                                </div>
                            </div>

                            {/* Purchased Items List */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest border-b border-border/40 pb-2">Items Purchased</h3>
                                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                                    {items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex gap-3 items-center">
                                            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-border bg-muted/20 shrink-0">
                                                <Image 
                                                    src={item.featuredImage || "/placeholder-collection.jpg"} 
                                                    alt={item.productName} 
                                                    fill 
                                                    className="object-contain p-1.5"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-foreground truncate">{item.productName}</h4>
                                                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">
                                                    {item.volume} × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="text-xs font-bold text-bprimary-dark shrink-0">
                                                ৳ {(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Navigation buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <Button 
                                onClick={handleShopRedirect}
                                className="h-12 bg-bprimary text-black font-black uppercase tracking-widest rounded-full hover:scale-[1.01] transition-transform duration-300 text-xs shadow-md"
                            >
                                Continue Shopping
                            </Button>
                            <Button 
                                variant="outline"
                                onClick={handleDashboardRedirect}
                                className="h-12 border-border text-foreground font-bold uppercase tracking-widest rounded-full hover:bg-muted transition-colors text-xs"
                            >
                                {isAuthenticated ? "Go to Dashboard" : "Track Order / Sign In"}
                            </Button>
                        </div>
                    </motion.div>

                    {/* Right Panel: Address & Totals */}
                    <motion.div 
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="md:col-span-5 space-y-4 md:space-y-6"
                    >
                        {/* Shipping details */}
                        <div className="bg-white border border-border rounded-2xl md:rounded-[2rem] p-4 md:p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center gap-2.5 text-bprimary-dark pb-2 border-b border-border/40">
                                <MapPin className="w-4 h-4" />
                                <h3 className="text-[10px] uppercase font-black tracking-widest">Delivery Address</h3>
                            </div>
                            
                            <div className="space-y-3.5 text-xs text-foreground/80 text-left">
                                <div>
                                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Recipient</p>
                                    <p className="font-bold text-foreground mt-0.5">{name}</p>
                                </div>
                                {phoneNumber && (
                                    <div>
                                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Contact Phone</p>
                                        <p className="font-mono font-bold text-foreground mt-0.5">{phoneNumber}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Destination Address</p>
                                    <p className="font-medium text-foreground/90 mt-0.5 leading-relaxed">
                                        {shippingAddress.streetAddress}, {shippingAddress.upazila}, {shippingAddress.district}, {shippingAddress.division}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pricing details */}
                        <div className="bg-white border border-border rounded-2xl md:rounded-[2rem] p-4 md:p-6 space-y-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center justify-between text-xs text-muted-foreground italic">
                                <span>Cart Subtotal</span>
                                <span>৳ {subtotal?.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground italic">
                                <span>Delivery Fee</span>
                                <span className={shippingFee === 0 ? "text-emerald-500 font-bold uppercase text-[10px] tracking-wider" : "font-mono"}>
                                    {shippingFee === 0 ? "Free" : `৳ ${shippingFee?.toLocaleString()}`}
                                </span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex items-center justify-between text-xs text-emerald-500 italic">
                                    <span>Promo Discount</span>
                                    <span>- ৳ {discountAmount?.toLocaleString()}</span>
                                </div>
                            )}
                            
                            <div className="pt-3.5 border-t border-border flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Total Paid</span>
                                <span className="text-lg md:text-xl font-heading font-black text-bprimary-dark">
                                    ৳ {totalAmount?.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
