"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { 
    Settings as SettingsIcon,
    Save,
    Loader2,
    Send,
    Bell,
    ShieldCheck,
    Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SettingsPage() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<any>({});

    const { data: settings, isLoading } = useQuery({
        queryKey: ["admin-settings"],
        queryFn: async () => {
            const { data } = await axios.get("/admin/settings");
            return data;
        }
    });

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const mutation = useMutation({
        mutationFn: (data: any) => axios.post("/admin/settings", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
            toast.success("Settings synchronized successfully");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update settings")
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-bprimary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-4xl font-heading font-medium text-white mb-2">
                    System <span className="text-bprimary">Intelligence</span>
                </h1>
                <p className="text-gray-500">Configure core engine parameters and integration nodes.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Telegram Integration */}
                <div className="group bg-white/3 rounded-[3rem] p-10 border border-white/5 transition-all hover:bg-white/5 hover:border-bprimary/20">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
                            <Send className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Notification Engine</p>
                            <h3 className="text-xl text-white font-medium">Telegram Integration</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Bot API Token</label>
                            <Input 
                                type="password"
                                value={formData.telegramBotToken || ""}
                                onChange={(e) => setFormData({...formData, telegramBotToken: e.target.value})}
                                className="bg-black/20 border-white/10 h-14 rounded-2xl focus:border-blue-500/50"
                                placeholder="Enter bot token..."
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-4">Authorized Chat ID</label>
                            <Input 
                                value={formData.telegramChatId || ""}
                                onChange={(e) => setFormData({...formData, telegramChatId: e.target.value})}
                                className="bg-black/20 border-white/10 h-14 rounded-2xl focus:border-blue-500/50"
                                placeholder="Enter chat ID..."
                            />
                        </div>
                    </div>
                    <p className="mt-6 text-xs text-gray-600 italic">
                        Real-time order notifications will be dispatched precisely to this endpoint upon checkout completion.
                    </p>
                </div>

                {/* Additional Settings can go here */}

                <div className="flex justify-end pt-8">
                    <Button 
                        type="submit" 
                        disabled={mutation.isPending}
                        className="bg-bprimary text-black font-bold uppercase tracking-widest rounded-2xl px-12 h-16 hover:scale-105 transition-transform shadow-2xl shadow-bprimary/20"
                    >
                        {mutation.isPending ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
                        Commit Settings
                    </Button>
                </div>
            </form>
        </div>
    );
}

