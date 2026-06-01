"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { 
    ShoppingBag, 
    ArrowRight, 
    Loader2, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Truck,
    Package
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const statusColors: any = {
    Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    Delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusIcons: any = {
    Pending: Clock,
    Processing: Package,
    Shipped: Truck,
    Delivered: CheckCircle2,
    Cancelled: XCircle,
};

export default function UserOrdersPage() {
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["my-orders"],
        queryFn: async () => {
            const { data } = await axios.get("/orders");
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
                    Acquisition <span className="text-bprimary">History</span>
                </h1>
                <p className="text-gray-500 mt-4 leading-relaxed">Tracking your olfactory collection through the ages.</p>
            </header>

            {orders.length === 0 ? (
                <div className="bg-white/5 border border-white/5 rounded-[3rem] p-16 text-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 rounded-full bg-bprimary/10 flex items-center justify-center mx-auto mb-8 border border-bprimary/20">
                        <ShoppingBag className="w-10 h-10 text-bprimary opacity-40" />
                    </div>
                    <h2 className="text-2xl text-white font-medium mb-4">No acquisitions found</h2>
                    <p className="text-gray-500 mb-10 leading-relaxed">Your fragrance journey is yet to begin. Start by exploring our curated collections.</p>
                    <Link href="/shop">
                        <Button className="h-14 bg-white text-black font-bold uppercase tracking-widest rounded-2xl px-12 hover:bg-bprimary transition-colors group">
                            Start Exploring
                            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order: any) => {
                        const Icon = statusIcons[order.status] || Package;
                        return (
                            <div key={order._id} className="group bg-white/3 border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/5 transition-all duration-500">
                                <div className="flex flex-col lg:flex-row justify-between gap-10">
                                    <div className="flex flex-col md:flex-row gap-10 items-start">
                                        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                            <Icon className={`w-8 h-8 ${statusColors[order.status].split(' ')[1]}`} />
                                        </div>
                                        <div className="space-y-4 min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <Badge className={`${statusColors[order.status]} border-none px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest`}>
                                                    {order.status}
                                                </Badge>
                                                <span className="text-xs font-mono text-gray-500 font-bold uppercase tracking-widest">
                                                    Order #{order._id.slice(-8).toUpperCase()}
                                                </span>
                                                <span className="text-[10px] text-gray-700 uppercase tracking-widest font-black">
                                                    {format(new Date(order.createdAt), "MMMM dd, yyyy")}
                                                </span>
                                            </div>
                                            <div className="flex gap-3 overflow-hidden">
                                                {order.items.map((item: any, idx: number) => (
                                                    <div key={idx} className="w-14 h-14 rounded-xl bg-white/5 border border-white/5 p-2 shrink-0 relative hover:scale-105 transition-transform">
                                                        <Image src={item.featuredImage} alt={item.productName} fill className="object-cover p-1" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-10">
                                        <div className="text-left lg:text-right mb-0 lg:mb-6">
                                            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] mb-1">TOTAL VALUATION</p>
                                            <p className="text-2xl font-medium text-white italic leading-none">৳{order.totalAmount.toLocaleString()}</p>
                                        </div>
                                        <Link href={`/dashboard/orders/${order._id}`}>
                                            <Button variant="outline" className="h-12 border-white/10 text-white rounded-xl px-10 hover:bg-white/5 group">
                                                Details
                                                <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
