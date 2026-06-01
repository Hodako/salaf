"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { 
    Search, 
    User as UserIcon, 
    Shield, 
    ShieldCheck, 
    MoreVertical, 
    Mail, 
    Phone, 
    Calendar,
    Filter,
    Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");

    const { data: users, isLoading } = useQuery({
        queryKey: ["admin-users", search, roleFilter],
        queryFn: async () => {
            const { data } = await axios.get("/admin/users", {
                params: { search, role: roleFilter }
            });
            return data;
        }
    });

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-heading font-medium text-white mb-4">
                        User <span className="text-bprimary">Management</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl leading-relaxed">
                        Full administrative control over your platform's members. Monitor activity, manage roles, and maintain security.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email or phone..."
                        className="pl-12 bg-white/5 border-white/10 h-12 rounded-xl focus:ring-bprimary"
                    />
                </div>
                <div className="flex gap-4">
                    <select 
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-gray-400 focus:outline-none focus:ring-1 focus:ring-bprimary min-w-[150px]"
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="customer">Customer</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl shadow-black/20">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/1">
                                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-gray-600">Member</th>
                                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-gray-600">Security / Role</th>
                                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-gray-600">Contact Details</th>
                                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-gray-600">Joined Date</th>
                                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-gray-600 text-right">Profile</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/2">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-8 h-8 text-bprimary animate-spin" />
                                            <p className="text-sm text-gray-500 italic uppercase tracking-widest">Retrieving Member Directory...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : users?.filter((u: any) => u.firebaseUid !== currentUser?.uid).map((user: any) => (
                                <tr key={user._id} className="group hover:bg-white/1 transition-all duration-300">
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-bprimary/10 border border-bprimary/20 flex items-center justify-center text-bprimary font-black uppercase text-lg shadow-inner">
                                                {user.image ? (
                                                    <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    user.name[0]
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white group-hover:text-bprimary transition-colors">{user.name}</p>
                                                <p className="text-[10px] text-gray-600 font-mono mt-0.5">{user.firebaseUid.slice(0, 12)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-3">
                                            {user.role === 'admin' ? (
                                                <ShieldCheck className="w-4 h-4 text-bprimary" />
                                            ) : (
                                                <Shield className="w-4 h-4 text-gray-600" />
                                            )}
                                            <Badge className={`border-none rounded-full px-4 text-[10px] font-bold uppercase tracking-widest ${
                                                user.role === 'admin' ? 'bg-bprimary/20 text-bprimary' : 'bg-white/5 text-gray-400'
                                            }`}>
                                                {user.role}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                                <Mail className="w-3 h-3" />
                                                {user.email}
                                            </div>
                                            {user.phoneNumber && (
                                                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                                    <Phone className="w-3 h-3" />
                                                    {user.phoneNumber}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-8 text-xs text-gray-500 font-medium whitespace-nowrap">
                                        {format(new Date(user.createdAt), "MMM dd, yyyy")}
                                    </td>
                                    <td className="p-8 text-right">
                                        <Link href={`/admin/users/${user._id}`}>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="w-10 h-10 rounded-full hover:bg-bprimary/10 hover:text-bprimary p-0"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
