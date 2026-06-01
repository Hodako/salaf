"use client";

import { useGetNewsletterEmailsQuery } from "@/store/api/adminApi";
import { format } from "date-fns";
import { Mail, Calendar, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";

export default function NewsletterAdminPage() {
    const { data: subscribers = [], isLoading, error } = useGetNewsletterEmailsQuery();

    const exportToCSV = () => {
        const headers = ["Email", "Subscribed At"];
        const rows = subscribers.map(s => [s.email, format(new Date(s.subscribedAt), "PPP p")]);
        
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `newsletter_subscribers_${format(new Date(), "yyyy-MM-dd")}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-bprimary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[60vh] items-center justify-center text-red-500">
                Failed to load subscribers.
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center bg-black border border-white/5 p-6 rounded-[2rem]">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Mail className="w-6 h-6 text-bprimary" />
                        Newsletter Subscribers
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Total {subscribers.length} subscribers found
                    </p>
                </div>
                <Button 
                    onClick={exportToCSV}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white gap-2 rounded-xl"
                >
                    <Download className="w-4 h-4" />
                    EXPORT CSV
                </Button>
            </div>

            <div className="bg-black border border-white/5 rounded-[2rem] overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-gray-400">Email Address</TableHead>
                            <TableHead className="text-gray-400">Subscription Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscribers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center py-10 text-gray-500">
                                    No subscribers yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            subscribers.map((sub, idx) => (
                                <TableRow key={idx} className="border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-bprimary/10 flex items-center justify-center text-bprimary text-xs">
                                                {sub.email[0].toUpperCase()}
                                            </div>
                                            {sub.email}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {format(new Date(sub.subscribedAt), "PPP p")}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
