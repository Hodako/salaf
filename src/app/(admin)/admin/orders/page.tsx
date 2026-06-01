"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { 
    ShoppingBag, 
    Search, 
    Filter, 
    ChevronRight, 
    Clock, 
    CheckCircle2, 
    Truck, 
    XCircle,
    Eye,
    MoreVertical
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

const statusColors: any = {
    Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    Delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusIcons: any = {
    Pending: Clock,
    Processing: Eye,
    Shipped: Truck,
    Delivered: CheckCircle2,
    Cancelled: XCircle,
};

export default function AdminOrdersPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["admin-orders"],
        queryFn: async () => {
            const { data } = await axios.get("/admin/orders");
            return data;
        }
    });

    const filteredOrders = orders.filter((order: any) => {
        const matchesSearch = 
            order._id.toLowerCase().includes(search.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
            order.user?.email?.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = statusFilter === "All" || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-heading font-medium text-white mb-2">
                        Order <span className="text-bprimary">Management</span>
                    </h1>
                    <p className="text-gray-500">Track and manage all customer purchases and fulfillment status.</p>
                </div>
            </header>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input 
                        placeholder="Search by Order ID, Name or Email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-white/10 pl-11 h-12 rounded-xl focus:border-bprimary/50"
                    />
                </div>
                <div className="flex gap-2">
                    {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            onClick={() => setStatusFilter(status)}
                            className={statusFilter === status ? "bg-bprimary text-black" : "border-white/10 text-gray-400 hover:text-white"}
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white/2 rounded-[2rem] border border-white/5 overflow-hidden">
                <div className="bg-white/1 overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/2">
                                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Order Data</th>
                                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-500 hidden md:table-cell">Customer</th>
                                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-500 hidden sm:table-cell">Status</th>
                                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Total</th>
                                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-500 text-right pr-12">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-10 h-20 bg-white/1" />
                                    </tr>
                                ))
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-gray-500 italic">
                                        No orders found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order: any) => (
                                    <tr key={order._id} className="group hover:bg-white/2 transition-all">
                                        <td className="py-6 px-8 border-b border-white/1 bg-white/1">
                                            <div className="flex flex-col">
                                                <span className="text-white font-mono text-sm group-hover:text-bprimary transition-colors">#{order._id.slice(-8).toUpperCase()}</span>
                                                <span className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">
                                                    {format(new Date(order.createdAt), "MMM dd, yyyy • hh:mm a")}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 hidden md:table-cell">
                                            <div className="flex flex-col min-w-[200px]">
                                                <span className="text-white font-medium">{order.user?.name || "Deleted User"}</span>
                                                <span className="text-xs text-gray-600 truncate">{order.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 hidden sm:table-cell">
                                            <Badge className={statusColors[order.status]}>
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-bprimary font-medium">৳ {(order.productRevenue || 0).toLocaleString()}</span>
                                                <span className="text-[10px] text-gray-600 font-mono hidden sm:inline-block">Total Settlement: ৳ {order.totalAmount.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right pr-12">
                                            <Link href={`/admin/orders/${order._id}`}>
                                                <Button size="sm" variant="ghost" className="hover:bg-bprimary/10 hover:text-bprimary rounded-full px-4">
                                                    <span className="hidden sm:inline-block">View Details</span>
                                                    <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
