"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
    Trash2,
    AlertTriangle,
    X,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isActionPending, setIsActionPending] = useState(false);

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

    // Toggle individual checkbox
    const handleToggleSelect = (orderId: string) => {
        setSelectedIds(prev => 
            prev.includes(orderId) 
                ? prev.filter(id => id !== orderId) 
                : [...prev, orderId]
        );
    };

    // Toggle Select All
    const handleToggleSelectAll = () => {
        const visibleIds = filteredOrders.map((o: any) => o._id);
        const allVisibleSelected = visibleIds.every((id: string) => selectedIds.includes(id));

        if (allVisibleSelected) {
            // Deselect all visible
            setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
        } else {
            // Select all visible (preserving previously selected ones not currently visible)
            setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
        }
    };

    // Single order delete
    const handleDeleteOrder = async (orderId: string) => {
        setIsActionPending(true);
        try {
            await axios.delete(`/admin/orders/${orderId}`);
            toast.success("Order deleted successfully");
            setSelectedIds(prev => prev.filter(id => id !== orderId));
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete order");
        } finally {
            setIsActionPending(false);
        }
    };

    // Bulk delete selected orders
    const handleBulkDelete = async () => {
        setIsActionPending(true);
        try {
            await axios.delete("/admin/orders", { data: { ids: selectedIds } });
            toast.success(`${selectedIds.length} orders deleted successfully`);
            setSelectedIds([]);
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete selected orders");
        } finally {
            setIsActionPending(false);
        }
    };

    const isAllVisibleSelected = filteredOrders.length > 0 && 
        filteredOrders.map((o: any) => o._id).every((id: string) => selectedIds.includes(id));

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative pb-24">
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
                        className="bg-transparent border-white/10 pl-11 h-12 rounded-xl focus:border-bprimary/50 text-white"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            onClick={() => setStatusFilter(status)}
                            className={statusFilter === status ? "bg-bprimary text-black hover:bg-bprimary/90" : "border-white/10 text-gray-400 hover:text-white hover:bg-white/5"}
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white/2 rounded-[2rem] border border-white/5 overflow-hidden shadow-xl">
                <div className="bg-white/1 overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/2">
                                <th className="px-6 py-5 w-12 text-center">
                                    <input 
                                        type="checkbox" 
                                        checked={isAllVisibleSelected}
                                        onChange={handleToggleSelectAll}
                                        disabled={isLoading || filteredOrders.length === 0}
                                        className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-bprimary text-bprimary accent-bprimary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                    />
                                </th>
                                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Order Data</th>
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
                                        <td colSpan={6} className="px-8 py-10 h-20 bg-white/1" />
                                    </tr>
                                ))
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-gray-500 italic">
                                        No orders found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order: any) => {
                                    const isSelected = selectedIds.includes(order._id);
                                    return (
                                        <tr key={order._id} className={`group transition-all duration-200 ${isSelected ? 'bg-bprimary/5' : 'hover:bg-white/2'}`}>
                                            <td className="py-6 px-6 text-center w-12">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected}
                                                    onChange={() => handleToggleSelect(order._id)}
                                                    className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-bprimary text-bprimary accent-bprimary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                                />
                                            </td>
                                            <td className="py-6 px-6">
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
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/admin/orders/${order._id}`}>
                                                        <Button size="sm" variant="ghost" className="hover:bg-white/10 text-gray-400 hover:text-white rounded-full px-4">
                                                            <span className="hidden sm:inline-block">View Details</span>
                                                            <ChevronRight className="w-4 h-4 ml-1" />
                                                        </Button>
                                                    </Link>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button 
                                                                size="sm" 
                                                                variant="ghost" 
                                                                className="hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-full w-10 h-10 p-0"
                                                                disabled={isActionPending}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-[#111] border-white/10 text-white">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="flex items-center gap-2">
                                                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                                                    Delete Order Record?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription className="text-gray-400">
                                                                    This action cannot be undone. You are about to permanently delete order
                                                                    <span className="text-white font-medium"> #{order._id.toUpperCase()} </span>
                                                                    from the database.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteOrder(order._id)}
                                                                    className="bg-red-500 hover:bg-red-600 text-white"
                                                                >
                                                                    Delete Order
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#111] border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-8 shadow-2xl shadow-black/80 animate-in slide-in-from-bottom-8 duration-300 min-w-[320px] md:min-w-[500px]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-bprimary/10 flex items-center justify-center text-bprimary font-bold">
                            {selectedIds.length}
                        </div>
                        <span className="text-sm font-medium text-white">Order(s) selected</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl px-5 h-10 flex items-center gap-2"
                                    disabled={isActionPending}
                                >
                                    {isActionPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    Delete Selected
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#111] border-white/10 text-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                        Confirm Bulk Delete
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-400">
                                        This action is irreversible. You are about to permanently delete 
                                        <span className="text-white font-medium font-mono"> {selectedIds.length} selected order(s) </span> 
                                        from the store records.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleBulkDelete}
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                        Yes, Delete All
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button 
                            variant="ghost"
                            onClick={() => setSelectedIds([])}
                            className="hover:bg-white/5 text-gray-400 hover:text-white rounded-xl w-10 h-10 p-0"
                            disabled={isActionPending}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
