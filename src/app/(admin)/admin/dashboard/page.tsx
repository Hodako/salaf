"use client";

import { DollarSign, Package, ShoppingBag, Users, Loader2, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { useAdminDashboard } from "@/hooks";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const statusColors: any = {
    Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    Processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    Delivered: "bg-green-500/10 text-green-500 border-green-500/20",
    Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function AdminDashboardPage() {
    const { data: stats, isLoading, error } = useAdminDashboard();

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#c06b40]" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex flex-col h-[50vh] items-center justify-center text-red-400">
                <p>Failed to load dashboard data.</p>
                <p className="text-sm opacity-70 mt-2">
                    {error && 'data' in error ? (error.data as any)?.message : (error as any)?.message || "Internal Server Error"}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-4xl font-heading font-medium text-white mb-2">
                    Dashboard <span className="text-bprimary">Overview</span>
                </h1>
                <p className="text-gray-400">Welcome back to Salaf admin. Your business pulse at a glance.</p>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue Card */}
                <div className="p-8 rounded-[2rem] bg-white/3 border border-white/5 flex flex-col relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-6 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                        <div className="w-8 h-8 rounded-xl bg-bprimary/10 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-bprimary" />
                        </div>
                        Total Revenue
                    </div>
                    <div className="text-4xl font-bold text-white tracking-tight">
                        ৳{stats.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-4 uppercase tracking-[0.2em] font-medium">
                        Gross Sales to Date
                    </div>
                </div>

                {/* Orders Card */}
                <div className="p-8 rounded-[2rem] bg-white/3 border border-white/5 flex flex-col relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-6 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-blue-500" />
                        </div>
                        Total Orders
                    </div>
                    <div className="text-4xl font-bold text-white tracking-tight">
                        {stats.totalOrders}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-4 uppercase tracking-[0.2em] font-medium">
                        Processed Checkouts
                    </div>
                </div>

                {/* Pending Orders Card */}
                <div className="p-8 rounded-[2rem] bg-white/3 border border-white/5 flex flex-col relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-6 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                        <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-yellow-500" />
                        </div>
                        Pending Actions
                    </div>
                    <div className="text-4xl font-bold text-white tracking-tight">
                        {stats.pendingOrders + stats.processingOrders}
                    </div>
                    <div className="text-[10px] text-yellow-500/70 mt-4 uppercase tracking-[0.2em] font-medium">
                        Requires Fulfillment
                    </div>
                </div>

                {/* Users Card */}
                <div className="p-10 rounded-[2.5rem] bg-white/3 border border-white/5 flex flex-col relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-6 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                        <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-green-500" />
                        </div>
                        Active Users
                    </div>
                    <div className="text-4xl font-bold text-white tracking-tight">
                        {stats.userCount}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-4 uppercase tracking-[0.2em] font-medium">
                        Registered Customers
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white/1 p-8 rounded-[2rem] border border-white/5">
                <div className="bg-white/1 border-b border-white/5 p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-white mb-1">Recent Transactions</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Latest order activities</p>
                    </div>
                    <Link href="/whoisadmin/admin/orders">
                        <Button variant="ghost" className="text-bprimary hover:bg-bprimary/10 font-bold rounded-full px-6">
                            View All <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                                <th className="px-8 py-5">Order ID</th>
                                <th className="px-8 py-5">Customer</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Total</th>
                                <th className="px-8 py-5 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {stats.recentTransactions?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-gray-500 italic">
                                        No recent transactions found.
                                    </td>
                                </tr>
                            ) : (
                                (
                                    stats.recentTransactions.map((order: any) => (
                                        <tr 
                                            key={order._id} 
                                            className="group hover:bg-white/5 cursor-pointer transition-colors relative"
                                            onClick={(e) => {
                                                // Only navigate if not clicking a nested link
                                                if (!(e.target as HTMLElement).closest('a')) {
                                                    window.location.href = `/whoisadmin/admin/orders/${order._id}`;
                                                }
                                            }}
                                        >
                                            <td className="px-8 py-6">
                                                <Link href={`/whoisadmin/admin/orders/${order._id}`} className="text-white font-mono text-sm hover:text-bprimary hover:underline transition-colors">
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </Link>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-medium">{order.user?.name || "Customer"}</span>
                                                        <span className="text-[10px] text-gray-600 truncate max-w-[150px]">{order.user?.email}</span>
                                                    </div>
                                                    {/* Product Links */}
                                                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                                                        {order.items?.map((item: any, idx: number) => (
                                                            <Link 
                                                                key={idx}
                                                                href={`/shop/${item.slug || "#"}`}
                                                                className="text-[9px] font-bold uppercase tracking-widest text-[#c06b40] hover:text-white transition-colors"
                                                            >
                                                                {item.productName}{idx < order.items.length - 1 ? "" : ""}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <Badge className={statusColors[order.status] + " rounded-full px-3"}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-bprimary font-bold">৳{(order.productRevenue || 0).toLocaleString()}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-[10px] text-gray-500 uppercase font-medium">
                                                    {format(new Date(order.createdAt), "MMM dd, yyyy")}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
