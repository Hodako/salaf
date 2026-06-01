"use client";

import React, { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { 
    User as UserIcon, 
    ShoppingBag, 
    TrendingUp, 
    CheckCircle2, 
    Calendar,
    Mail,
    Phone,
    Shield,
    ShieldCheck,
    ChevronLeft,
    Loader2,
    ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

const statusColors: any = {
    Pending: "bg-yellow-500/10 text-yellow-500",
    Processing: "bg-blue-500/10 text-blue-500",
    Shipped: "bg-purple-500/10 text-purple-500",
    Delivered: "bg-green-500/10 text-green-500",
    Cancelled: "bg-red-500/10 text-red-500",
};

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-user", id],
        queryFn: async () => {
            const { data } = await axios.get(`/admin/users/${id}`);
            return data;
        }
    });

    const updateRole = useMutation({
        mutationFn: async (role: string) => {
            const { data } = await axios.patch(`/admin/users/${id}`, { role });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-user", id] });
            toast.success("User role updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to update role");
        }
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-bprimary animate-spin" />
                <p className="text-sm text-gray-500 animate-pulse uppercase tracking-widest font-bold">Synchronizing Member Data...</p>
            </div>
        );
    }

    const { user, stats, recentOrders } = data || {};

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Navigation & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <Link href="/admin/users" className="group flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-transform group-hover:-translate-x-1">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Directory</span>
                </Link>

                <div className="flex gap-4">
                    <Button 
                        variant="outline" 
                        className="h-12 border-white/10 text-gray-400 hover:text-white rounded-2xl gap-2 font-bold uppercase tracking-widest text-[10px]"
                        onClick={() => updateRole.mutate(user.role === 'admin' ? 'customer' : 'admin')}
                        disabled={updateRole.isPending}
                    >
                        {user.role === 'admin' ? (
                            <><Shield className="w-4 h-4" /> Demote to Customer</>
                        ) : (
                            <><ShieldCheck className="w-4 h-4 text-bprimary" /> Promote to Admin</>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Profile Card */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group shadow-2xl shadow-black/40">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-bprimary/5 blur-[60px] -mr-16 -mt-16 group-hover:bg-bprimary/10 transition-colors" />
                        
                        <div className="flex flex-col items-center text-center space-y-8 relative z-10">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-bprimary/10 border border-bprimary/20 flex items-center justify-center text-bprimary text-5xl font-black shadow-inner overflow-hidden">
                                {user.image ? (
                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user.name[0]
                                )}
                            </div>
                            
                            <div>
                                <h1 className="text-3xl font-heading font-medium text-white mb-2">{user.name}</h1>
                                <div className="flex items-center justify-center gap-2">
                                    <Badge className={`${user.role === 'admin' ? 'bg-bprimary/20 text-bprimary' : 'bg-white/5 text-gray-400'} border-none rounded-full px-4 text-[10px] font-bold uppercase tracking-widest`}>
                                        {user.role}
                                    </Badge>
                                </div>
                            </div>

                            <div className="w-full space-y-6 pt-6 border-t border-white/5 text-left">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/item:bg-bprimary/10 transition-colors">
                                            <Mail className="w-4 h-4 text-gray-500 group-hover/item:text-bprimary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Email Address</span>
                                            <span className="text-sm text-gray-300 font-medium">{user.email}</span>
                                        </div>
                                    </div>

                                    {user.phoneNumber && (
                                        <div className="flex items-center gap-4 group/item">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/item:bg-bprimary/10 transition-colors">
                                                <Phone className="w-4 h-4 text-gray-500 group-hover/item:text-bprimary" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Phone Number</span>
                                                <span className="text-sm text-gray-300 font-medium">{user.phoneNumber}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 group/item">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/item:bg-bprimary/10 transition-colors">
                                            <Calendar className="w-4 h-4 text-gray-500 group-hover/item:text-bprimary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Member Since</span>
                                            <span className="text-sm text-gray-300 font-medium">{format(new Date(user.createdAt), "MMMM dd, yyyy")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats & Activity */}
                <div className="lg:col-span-8 space-y-12">
                    {user.role !== 'admin' && stats ? (
                        <>
                            {/* Performance metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                            <ShoppingBag className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Orders</span>
                                    </div>
                                    <div className="text-3xl font-heading font-medium text-white mb-2">{stats.totalOrders}</div>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Historical Volume</p>
                                </div>

                                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-bprimary/10 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-bprimary" />
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Spent</span>
                                    </div>
                                    <div className="text-3xl font-heading font-medium text-white mb-2">৳{stats.totalSpent.toLocaleString()}</div>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Lifetime Value</p>
                                </div>

                                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Success Rate</span>
                                    </div>
                                    <div className="text-3xl font-heading font-medium text-white mb-2">{stats.successRate}%</div>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Delivery Performance</p>
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-4">
                                    <h2 className="text-xl font-heading font-medium text-white">Purchase History</h2>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Latest activity</span>
                                </div>

                                <div className="bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-white/1">
                                                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-600">Order ID</th>
                                                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-600">Status</th>
                                                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-600">Total</th>
                                                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-gray-600">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/2">
                                            {recentOrders?.map((order: any) => (
                                                <tr key={order._id} className="group hover:bg-white/1 transition-colors">
                                                    <td className="p-6">
                                                        <Link href={`/admin/orders/${order._id}`} className="text-sm font-bold text-white group-hover:text-bprimary transition-colors flex items-center gap-2">
                                                            #{order._id.slice(-8).toUpperCase()}
                                                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </Link>
                                                    </td>
                                                    <td className="p-6">
                                                        <Badge className={`${statusColors[order.status]} border-none rounded-full px-3 text-[10px] font-bold uppercase tracking-widest`}>
                                                            {order.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-6">
                                                        <span className="text-sm font-bold text-gray-300">৳{order.totalAmount.toLocaleString()}</span>
                                                    </td>
                                                    <td className="p-6 text-xs text-gray-500">
                                                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                                                    </td>
                                                </tr>
                                            ))}
                                            {recentOrders?.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-20 text-center text-gray-600 italic uppercase tracking-widest text-[10px] font-bold">
                                                        No transaction history found for this member.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white/5 p-12 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-center space-y-6 opacity-40 grayscale h-[400px]">
                            <Shield className="w-16 h-16 text-bprimary" />
                            <div>
                                <h3 className="text-xl font-heading font-medium text-white mb-2">Administrative Profile</h3>
                                <p className="text-gray-500 max-w-md text-sm leading-relaxed">System administrators do not have customer performance metrics or order history tracked within this analytics engine.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
