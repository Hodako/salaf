"use client";

import React from "react";
import { User, Mail, Phone, MapPin, ShieldCheck, Loader2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";

export default function ProfilePage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-bprimary animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="p-4 sm:p-6 md:p-12 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-heading font-medium text-white italic">
                        My <span className="text-bprimary">Profile</span>
                    </h1>
                    <p className="text-gray-500 mt-2 md:mt-4 leading-relaxed text-sm md:text-base">Manage your personal information and delivery preferences.</p>
                </div>
                <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white rounded-xl md:rounded-2xl h-11 md:h-12 px-6 md:px-8 flex items-center justify-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
                <div className="lg:col-span-4">
                    <div className="bg-white/5 border border-white/5 rounded-2xl md:rounded-[3rem] p-6 md:p-10 text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-bprimary/5 blur-[60px] rounded-full -mr-16 -mt-16" />
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-[2.5rem] bg-linear-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 md:mb-8 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-700">
                            {user.image ? (
                                <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 md:w-12 md:h-12 text-bprimary" />
                            )}
                        </div>
                        <h2 className="text-xl md:text-2xl text-white font-medium mb-2">{user.name}</h2>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bprimary/10 border border-bprimary/20 text-bprimary text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Customer
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="bg-white/3 border border-white/5 rounded-2xl md:rounded-[3rem] p-6 md:p-12 space-y-8 md:space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                            <div className="space-y-1 md:space-y-2">
                                <div className="flex items-center gap-3 text-gray-500 mb-1.5 md:mb-3">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Primary Email</span>
                                </div>
                                <p className="text-white text-base md:text-lg font-light tracking-wide break-all">{user.email || "Not Provided"}</p>
                            </div>
                            <div className="space-y-1 md:space-y-2">
                                <div className="flex items-center gap-3 text-gray-500 mb-1.5 md:mb-3">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Contact Number</span>
                                </div>
                                <p className="text-white text-base md:text-lg font-light tracking-wide">{user.phoneNumber || "Not Provided"}</p>
                            </div>
                        </div>

                        <div className="pt-6 md:pt-10 border-t border-white/5 space-y-6">
                            <div className="flex items-center gap-3 text-gray-500 mb-2 md:mb-4">
                                <MapPin className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Default Delivery Address</span>
                            </div>
                            {user.address ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Street Address</p>
                                        <p className="text-gray-300 text-sm md:text-base">{user.address.streetAddress}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Region</p>
                                        <p className="text-gray-300 text-sm md:text-base">
                                            {user.address.upazila}, {user.address.district}, {user.address.division} - {user.address.postCode}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-600 italic text-sm">No delivery address saved yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
