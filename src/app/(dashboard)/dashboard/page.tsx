"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
    ShoppingBag,
    User,
    MapPin,
    Package,
    Clock,
    Loader2,
    Settings,
    LogOut,
    ExternalLink,
    Phone,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    Star,
    Heart
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import Link from "next/link";
import Image from "next/image";

const statusColors: any = {
    Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    Delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function UserDashboardPage() {
    const { user, signOut, loading: authLoading } = useAuth();

    const { data: orders = [], isLoading: ordersLoading } = useQuery({
        queryKey: ["my-orders"],
        queryFn: async () => {
            const { data } = await axios.get("/orders");
            return data;
        },
        enabled: !!user
    });

    const stats = React.useMemo(() => {
        const wishlistCount = (user as any)?.wishlist?.length || 0;
        if (!orders.length) return { total: 0, count: 0, lastOrder: null, pendingCount: 0, wishlistCount };
        return {
            total: orders.reduce((acc: number, o: any) => acc + o.totalAmount, 0),
            count: orders.length,
            lastOrder: orders[0],
            pendingCount: orders.filter((o: any) => o.status === "Pending" || o.status === "Processing").length,
            wishlistCount
        };
    }, [orders, user]);

    const greeting = React.useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }, []);

    if (authLoading || (user && ordersLoading)) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-bprimary-dark animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="bg-muted p-12 rounded-[2.5rem] border border-border text-center max-w-md w-full">
                    <User className="w-16 h-16 text-bprimary-dark opacity-20 mx-auto mb-6" />
                    <h2 className="text-2xl text-foreground font-medium mb-4">Account Access Required</h2>
                    <p className="text-muted-foreground mb-8 leading-relaxed">Please sign in to view your orders, track shipments and manage your profile.</p>
                    <Link href="/auth?redirect=/dashboard">
                        <Button className="w-full h-14 bg-bprimary-dark text-white font-bold uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/10">
                            Sign In to Account
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-12 space-y-12">
            
            {/* Top Greeting & Quick Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <span className="text-bprimary-dark font-bold uppercase tracking-[0.3em] text-[10px] mb-3 block">{greeting}</span>
                    <h1 className="text-4xl md:text-5xl font-heading font-medium text-foreground italic">Marhaba, {user.name}</h1>
                </div>
                <div className="flex gap-4">
                    <Link href="/shop">
                        <Button className="h-12 bg-foreground text-background font-bold uppercase tracking-widest text-[10px] rounded-2xl px-8 hover:bg-bprimary-dark transition-colors">
                            New Discovery
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card border border-border p-8 rounded-[2rem] space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-bprimary-dark/5 blur-3xl rounded-full" />
                    <ShoppingBag className="w-6 h-6 text-bprimary-dark" />
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Total Collections</p>
                        <p className="text-3xl font-medium text-foreground">{stats.count}</p>
                    </div>
                </div>

                <div className="bg-card border border-border p-8 rounded-[2rem] space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full" />
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Investment</p>
                        <p className="text-3xl font-medium text-foreground">৳{stats.total.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-card border border-border p-8 rounded-[2rem] space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl rounded-full" />
                    <Heart className="w-6 h-6 text-red-500" />
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Wishlist</p>
                        <p className="text-3xl font-medium text-foreground">{stats.wishlistCount}</p>
                    </div>
                </div>

                <div className="bg-card border border-border p-8 rounded-[2rem] space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-3xl rounded-full" />
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Status</p>
                        <p className="text-2xl font-medium text-foreground uppercase tracking-tighter">Verified Member</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Review Prompt for Delivered Orders */}
                    {orders.some((o: any) => o.status === 'Delivered') && (
                        <div className="bg-bprimary-dark/10 border border-bprimary-dark/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in duration-700">
                            <div className="flex gap-5 items-center">
                                <div className="w-14 h-14 rounded-2xl bg-bprimary-dark/20 flex items-center justify-center text-bprimary-dark shadow-inner shrink-0">
                                    <Star className="w-7 h-7 fill-bprimary-dark" />
                                </div>
                                <div>
                                    <h3 className="text-foreground font-medium">Share your experience</h3>
                                    <p className="text-muted-foreground text-xs">You have items ready to be reviewed. Your feedback means everything to us.</p>
                                </div>
                            </div>
                            <Link href="/dashboard/reviews">
                                <Button className="bg-bprimary-dark text-white font-bold h-12 px-8 rounded-xl uppercase tracking-widest text-[10px] whitespace-nowrap shadow-lg shadow-primary/10">
                                    Leave a Review
                                </Button>
                            </Link>
                        </div>
                    )}

                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-2xl font-heading font-medium text-foreground italic">Recent Acquisitions</h2>
                        <Link href="/dashboard/orders" className="text-[10px] text-bprimary-dark uppercase tracking-widest font-bold hover:underline">View All History</Link>
                    </div>

                    {orders.length === 0 ? (
                        <div className="bg-muted p-16 rounded-[3rem] border border-border text-center">
                            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-6 opacity-20" />
                            <h3 className="text-xl text-foreground font-medium mb-3">Empty Gallery</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">Your fragrance story is waiting to be written. Begin with your first acquisition.</p>
                            <Link href="/shop">
                                <Button className="bg-foreground text-background px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]">Explore Shop</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.slice(0, 3).map((order: any) => (
                                <div key={order._id} className="bg-card border border-border rounded-[2.5rem] p-8 hover:bg-muted/50 transition-all group relative overflow-hidden">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <Badge className={statusColors[order.status] + " px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none"}>
                                                    {order.status}
                                                </Badge>
                                                <span className="text-[10px] font-mono text-muted-foreground">#{order._id.slice(-8).toUpperCase()}</span>
                                            </div>
                                            <div className="flex gap-3">
                                                {order.items.slice(0, 4).map((item: any, idx: number) => (
                                                    <div key={idx} className="w-16 h-16 rounded-xl bg-muted border border-border p-2 overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-700">
                                                        <Image src={item.featuredImage} alt={item.productName} fill className="object-cover p-1" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-between text-right">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">TOTAL AMOUNT</p>
                                                <p className="text-2xl font-medium text-bprimary-dark">৳{order.totalAmount.toLocaleString()}</p>
                                            </div>
                                            <Link href={`/dashboard/orders/${order._id}`}>
                                                <Button variant="ghost" className="text-[10px] uppercase font-bold tracking-widest text-foreground group-hover:text-bprimary-dark p-0 h-auto">
                                                    Details <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Discovery Section */}
                    <div className="bg-card border border-border p-12 rounded-[3rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-bprimary-dark/5 blur-[100px] -mr-32 -mt-32" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-heading font-medium text-foreground mb-4 italic">The Olfactory Journey</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-8">Share your experience with the world. Your reviews help other collectors find their next signature scent.</p>
                                <Link href="/dashboard/reviews">
                                    <Button className="bg-bprimary-dark text-white px-10 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">Write a Review</Button>
                                </Link>
                            </div>
                            <div className="w-48 h-48 bg-muted border border-border rounded-[2rem] flex items-center justify-center p-8 group-hover:scale-105 transition-transform duration-700">
                                <Star className="w-full h-full text-bprimary-dark/10 rotate-12 group-hover:text-bprimary-dark/40 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Fulfillment Details */}
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-bprimary-dark" />
                                Shipped To
                            </h3>
                            {(user as any).address ? (
                                <div className="space-y-1 text-muted-foreground text-sm leading-relaxed">
                                    <p className="text-foreground font-medium">{(user as any).address.streetAddress}</p>
                                    <p>{(user as any).address.upazila}, {(user as any).address.district}</p>
                                    <p>{(user as any).address.division} - {(user as any).address.postCode}</p>
                                    <div className="pt-4 flex items-center gap-3 text-bprimary-dark text-[10px] font-black uppercase tracking-widest">
                                        <Phone className="w-3 h-3" />
                                        {(user as any).phoneNumber || "Verified"}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-gray-600 text-[10px] italic mb-4">No fulfillment address on record.</p>
                                    <Button variant="outline" className="h-10 border-white/10 text-[9px] font-bold uppercase tracking-widest rounded-xl hover:bg-white/5">Update Profile</Button>
                                </div>
                            )}
                        </div>

                        {user.role === "admin" && (
                            <div className="pt-8 border-t border-border">
                                <Link href="/admin/dashboard">
                                    <Button className="w-full h-12 bg-muted text-foreground border border-border font-bold uppercase tracking-widest rounded-xl text-[9px] hover:bg-muted/80">
                                        Admin Concierge Panel
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Support & Concierge */}
                    <div className="bg-bprimary-dark/5 border border-bprimary-dark/10 rounded-[2.5rem] p-8 text-center space-y-4">
                        <div className="w-12 h-12 bg-bprimary-dark/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-bprimary-dark/10">
                            <User className="w-5 h-5 text-bprimary-dark" />
                        </div>
                        <h4 className="text-bprimary-dark font-bold uppercase tracking-widest text-[9px]">Personal Concierge</h4>
                        <p className="text-muted-foreground text-[10px] leading-relaxed">Need assistance with a selection or an existing order?</p>
                        <Button className="w-full h-11 bg-foreground text-background font-bold uppercase tracking-widest rounded-xl text-[9px] shadow-lg shadow-primary/5">Start Conversation</Button>
                    </div>

                </div>

            </div>
        </div>
    );
}
