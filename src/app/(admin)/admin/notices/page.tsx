"use client";

import { useState } from "react";
import { 
    useGetNoticesQuery, 
    useCreateNoticeMutation, 
    useUpdateNoticeMutation, 
    useDeleteNoticeMutation 
} from "@/store/api/adminApi";
import { format } from "date-fns";
import { Megaphone, Plus, Edit, Trash2, Loader2, Calendar as CalendarIcon, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function NoticesAdminPage() {
    const { data: notices = [], isLoading } = useGetNoticesQuery();
    const [createNotice] = useCreateNoticeMutation();
    const [updateNotice] = useUpdateNoticeMutation();
    const [deleteNotice] = useDeleteNoticeMutation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<any>(null);

    const [formData, setFormData] = useState({
        content: "",
        startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        endDate: format(new Date(Date.now() + 86400000), "yyyy-MM-dd'T'HH:mm"),
        isActive: true,
        priority: 0
    });

    const resetForm = () => {
        setFormData({
            content: "",
            startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            endDate: format(new Date(Date.now() + 86400000), "yyyy-MM-dd'T'HH:mm"),
            isActive: true,
            priority: 0
        });
        setEditingNotice(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingNotice) {
                await updateNotice({ id: editingNotice._id, ...formData }).unwrap();
                toast.success("Notice updated");
            } else {
                await createNotice(formData).unwrap();
                toast.success("Notice created");
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error.data?.error || "Failed to save notice");
        }
    };

    const handleEdit = (notice: any) => {
        setEditingNotice(notice);
        setFormData({
            content: notice.content,
            startDate: format(new Date(notice.startDate), "yyyy-MM-dd'T'HH:mm"),
            endDate: format(new Date(notice.endDate), "yyyy-MM-dd'T'HH:mm"),
            isActive: notice.isActive,
            priority: notice.priority
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteNotice(id).unwrap();
            toast.success("Notice deleted");
        } catch (error) {
            toast.error("Failed to delete notice");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-bprimary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center bg-black border border-white/5 p-6 rounded-[2rem]">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                        <Megaphone className="w-6 h-6 text-bprimary" />
                        Announcement Notices
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Manage scrolling notices for the website top bar
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-bprimary hover:bg-bprimary/90 text-black font-bold gap-2 rounded-xl">
                            <Plus className="w-4 h-4" />
                            CREATE NOTICE
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-lg rounded-[2rem]">
                        <DialogHeader>
                            <DialogTitle>{editingNotice ? "Edit Notice" : "Create New Notice"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Notice Content (Markdown Support)</label>
                                <Textarea 
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Enter notice text here..."
                                    className="bg-zinc-900 border-white/10 min-h-[100px] rounded-xl"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Start Date & Time</label>
                                    <Input 
                                        type="datetime-local"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="bg-zinc-900 border-white/10 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">End Date & Time</label>
                                    <Input 
                                        type="datetime-local"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="bg-zinc-900 border-white/10 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Priority (Higher = First)</label>
                                    <Input 
                                        type="number"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                        className="bg-zinc-900 border-white/10 rounded-xl"
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-8">
                                    <input 
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-bprimary focus:ring-bprimary"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-gray-400 cursor-pointer">Active</label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl border-white/10 hover:bg-white/5 transition-colors">
                                    CANCEL
                                </Button>
                                <Button type="submit" className="bg-bprimary hover:bg-bprimary/90 text-black font-bold rounded-xl px-8">
                                    {editingNotice ? "UPDATE" : "SAVE"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-black border border-white/5 rounded-[2rem] overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-gray-400">Notice Content</TableHead>
                            <TableHead className="text-gray-400">Schedule</TableHead>
                            <TableHead className="text-gray-400">Status</TableHead>
                            <TableHead className="text-right text-gray-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {notices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                                    No notices created yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            notices.map((notice, idx) => (
                                <TableRow key={idx} className="border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell className="max-w-md">
                                        <p className="line-clamp-2 text-sm text-gray-200">{notice.content}</p>
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-400 space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <CalendarIcon className="w-3 h-3" />
                                            {format(new Date(notice.startDate), "MMM d, yyyy h:mm a")}
                                        </div>
                                        <div className="flex items-center gap-1.5 pl-[18px]">
                                            To {format(new Date(notice.endDate), "MMM d, yyyy h:mm a")}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {notice.isActive ? (
                                            <div className="flex items-center gap-1.5 text-green-500 text-xs font-semibold">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                ACTIVE
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold">
                                                <XCircle className="w-3.5 h-3.5" />
                                                INACTIVE
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => handleEdit(notice)}
                                                className="w-8 h-8 p-0 rounded-lg border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => handleDelete(notice._id)}
                                                className="w-8 h-8 p-0 rounded-lg border-white/10 hover:bg-white/5 text-gray-400 hover:text-red-500 transition-all border-red-500/10"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
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
