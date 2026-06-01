"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, LayoutTemplate, AlertTriangle, PenTool, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAdminPages, useDeletePage, useCreatePage } from "@/hooks/useAdminPages";
import { toast } from "sonner";
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

export default function AdminPagesDashboard() {
    const { data: pages = [], isLoading, error } = useAdminPages();
    const { mutateAsync: deletePage } = useDeletePage();
    const { mutateAsync: createPage } = useCreatePage();
    const [isCreating, setIsCreating] = useState(false);

    const handleDelete = async (id: string) => {
        try {
            await deletePage(id);
            toast.success("Page deleted successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete page");
        }
    };

    const handleCreateDraft = async (type: 'page' | 'product_template' | 'shop_template') => {
        try {
            setIsCreating(true);
            const title = type === 'page' ? 'New Page' : type === 'product_template' ? 'New Product Template' : 'New Shop Template';
            const slug = `${type}-${Date.now()}`;
            
            const newDoc = await createPage({
                title,
                slug,
                type,
                status: 'draft',
                isHome: false
            });
            
            toast.success("Draft created");
            // Optionally auto redirect to builder, but here we just refresh the list
            window.location.href = `/admin/pages/${newDoc._id}`;
        } catch (error: any) {
            toast.error(error.message || "Failed to create draft");
        } finally {
            setIsCreating(false);
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'product_template': return <span className="bg-purple-500/20 text-purple-300 font-mono text-[10px] uppercase px-2 py-1 rounded">Product Template</span>;
            case 'shop_template': return <span className="bg-blue-500/20 text-blue-300 font-mono text-[10px] uppercase px-2 py-1 rounded">Shop Template</span>;
            default: return <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] uppercase px-2 py-1 rounded">Standard Page</span>;
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-medium tracking-wide text-white mb-2 flex items-center gap-3">
                        <LayoutTemplate className="w-8 h-8 text-[#c06b40]" /> Theme & Pages
                    </h1>
                    <p className="text-gray-400">Manage pages, product templates, and global layouts with the visual builder.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button disabled={isCreating} onClick={() => handleCreateDraft('product_template')} variant="outline" className="border-white/10 text-white bg-black hover:bg-white/5">
                        <Plus className="w-4 h-4 mr-2" /> Product Template
                    </Button>
                    <Button disabled={isCreating} onClick={() => handleCreateDraft('page')} className="bg-[#c06b40] text-white hover:bg-[#c06b40]/90">
                        {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} Standard Page
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                {isLoading ? (
                    <div className="p-16 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#c06b40]" />
                    </div>
                ) : error ? (
                    <div className="p-12 text-center text-red-400">
                        <p>Error loading pages.</p>
                    </div>
                ) : pages.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                        <LayoutDashboard className="w-16 h-16 text-gray-700 mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">Build Your First Page</h3>
                        <p className="text-gray-400 max-w-sm mb-6">Create a stunning visual experience using the drag-and-drop Theme Builder.</p>
                        <Button onClick={() => handleCreateDraft('page')} className="bg-white text-black hover:bg-gray-200">
                            Create Blank Page
                        </Button>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/2">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Title & Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Type / Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {pages.map((page: any) => (
                                <tr key={page._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-white flex items-center gap-2">
                                                {page.title} 
                                                {page.isHome && <span className="bg-[#c06b40] text-[9px] px-1.5 py-0.5 rounded text-white tracking-widest uppercase font-bold">FRONT PAGE</span>}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1 font-mono">/{page.slug}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {getTypeBadge(page.type)}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border ${page.status === 'published' ? 'border-green-500/20 text-green-400 bg-green-500/5' : 'border-yellow-500/20 text-yellow-500 bg-yellow-500/5'}`}>
                                            {page.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/pages/${page._id}`}>
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10" title="Visual Builder">
                                                    <PenTool className="w-4 h-4 text-[#c06b40]" />
                                                </Button>
                                            </Link>
                                            
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-400 hover:bg-red-500/10" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-[#111] border-white/10 text-white">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="flex items-center gap-2">
                                                            <AlertTriangle className="w-5 h-5 text-red-500" />
                                                            Delete "{page.title}"?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription className="text-gray-400">
                                                            This removes the page permanently. If this is a live page, it will immediately 404 for users.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(page._id)} className="bg-red-500 hover:bg-red-600 text-white">
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
