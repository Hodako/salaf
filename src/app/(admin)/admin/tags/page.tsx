"use client";

import { useState } from "react";
import { 
    Plus, 
    Search, 
    MoreHorizontal, 
    Edit2, 
    Trash2, 
    Tags as TagIcon,
    Loader2,
    AlertCircle
} from "lucide-react";
import { 
    useTags, 
    useCreateTag, 
    useUpdateTag, 
    useDeleteTag 
} from "@/hooks";
import { FormFieldLabel } from "@/components/admin/products/FormHelpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function TagsPage() {
    const { data: tags = [], isLoading } = useTags();
    const { mutateAsync: createTag, isPending: isCreating } = useCreateTag();
    const { mutateAsync: updateTag, isPending: isUpdating } = useUpdateTag();
    const { mutateAsync: deleteTag, isPending: isDeleting } = useDeleteTag();

    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<any>(null);
    const [formData, setFormData] = useState({ name: "", slug: "" });

    const filteredTags = tags.filter((t: any) => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenAdd = () => {
        setSelectedTag(null);
        setFormData({ name: "", slug: "" });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (tag: any) => {
        setSelectedTag(tag);
        setFormData({ 
            name: tag.name, 
            slug: tag.slug
        });
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedTag) {
                await updateTag({ id: selectedTag._id, data: formData });
                toast.success("Tag updated successfully");
            } else {
                await createTag(formData);
                toast.success("Tag created successfully");
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Something went wrong");
        }
    };

    const handleDelete = async () => {
        if (!selectedTag) return;
        try {
            await deleteTag(selectedTag._id);
            toast.success("Tag deleted successfully");
            setIsDeleteDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete tag");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <TagIcon className="w-8 h-8 text-[#c06b40]" /> Tags
                    </h1>
                    <p className="text-gray-500 mt-1">Manage labels used for searching and discovery.</p>
                </div>
                <Button onClick={handleOpenAdd} className="bg-[#c06b40] hover:bg-[#a85d35] text-white px-6">
                    <Plus className="w-4 h-4 mr-2" /> Add Tag
                </Button>
            </div>

            {/* Filters */}
            <div className="relative group max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#c06b40] transition-colors" />
                <Input 
                    placeholder="Search tags..." 
                    className="pl-10 bg-[#111] border-white/5 focus:border-[#c06b40]/50 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/2">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Slug</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-8 bg-white/5 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredTags.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                        No tags found.
                                    </td>
                                </tr>
                            ) : (
                                filteredTags.map((tag: any) => (
                                    <tr key={tag._id} className="hover:bg-white/1 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-white">{tag.name}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant="secondary" className="bg-white/5 text-gray-400 border-none font-mono text-[10px]">
                                                {tag.slug}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                                                    onClick={() => handleOpenEdit(tag)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                                                    onClick={() => {
                                                        setSelectedTag(tag);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#111] border-white/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedTag ? "Edit Tag" : "Add New Tag"}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Provide the details for the tag below.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-6 py-4">
                        <div className="space-y-2">
                            <FormFieldLabel label="Tag Name" tooltip="The tag label (e.g. Woody, Floral)." required />
                            <Input 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-black border-white/5 focus:border-[#c06b40]/50 h-10"
                                placeholder="e.g. Summer Collection"
                            />
                            <p className="text-[10px] text-gray-500 ml-1">Tip: Use descriptive keywords like 'Long Lasting' or 'Premium'.</p>
                        </div>
                        <div className="space-y-2">
                             <FormFieldLabel label="Slug" tooltip="URL identifier. Auto-generated if left blank." />
                            <Input 
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="bg-black border-white/5 focus:border-[#c06b40]/50 font-mono text-sm h-10"
                                placeholder="e.g. summer-collection"
                            />
                            <p className="text-[10px] text-gray-500 ml-1 italic">salaf.com/tags/{formData.slug || '...'}</p>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isCreating || isUpdating} className="bg-[#c06b40] hover:bg-[#a85d35] text-white min-w-[100px]">
                                {isCreating || isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (selectedTag ? "Save Changes" : "Create")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-[#111] border-white/10 text-white">
                    <AlertDialogHeader>
                        <div className="w-12 h-12 rounded-full bg-red-400/10 flex items-center justify-center mb-4">
                            <AlertCircle className="w-6 h-6 text-red-400" />
                        </div>
                        <AlertDialogTitle>Delete Tag?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete <span className="text-white font-medium">"{selectedTag?.name}"</span>? 
                            This action cannot be undone and may affect product categorization.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-10">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white border-none h-10 min-w-[80px]"
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
