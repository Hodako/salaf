"use client";

import { useState } from "react";
import { 
    Plus, 
    Search, 
    MoreHorizontal, 
    Edit2, 
    Trash2, 
    FolderTree,
    Loader2,
    AlertCircle
} from "lucide-react";
import { 
    useCollections, 
    useCreateCollection, 
    useUpdateCollection, 
    useDeleteCollection 
} from "@/hooks";
import { FormFieldLabel, ImgBBUploader } from "@/components/admin/products";
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

export default function CollectionsPage() {
    const { data: collections = [], isLoading } = useCollections();
    const { mutateAsync: createCollection, isPending: isCreating } = useCreateCollection();
    const { mutateAsync: updateCollection, isPending: isUpdating } = useUpdateCollection();
    const { mutateAsync: deleteCollection, isPending: isDeleting } = useDeleteCollection();

    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState<any>(null);
    const [formData, setFormData] = useState({ name: "", slug: "", description: "", imageUrl: "" });

    const filteredCollections = collections.filter((c: any) => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenAdd = () => {
        setSelectedCollection(null);
        setFormData({ name: "", slug: "", description: "", imageUrl: "" });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (collection: any) => {
        setSelectedCollection(collection);
        setFormData({ 
            name: collection.name, 
            slug: collection.slug, 
            description: collection.description || "",
            imageUrl: collection.imageUrl || ""
        });
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedCollection) {
                await updateCollection({ id: selectedCollection._id, data: formData });
                toast.success("Collection updated successfully");
            } else {
                await createCollection(formData);
                toast.success("Collection created successfully");
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Something went wrong");
        }
    };

    const handleDelete = async () => {
        if (!selectedCollection) return;
        try {
            await deleteCollection(selectedCollection._id);
            toast.success("Collection deleted successfully");
            setIsDeleteDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete collection");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <FolderTree className="w-8 h-8 text-[#c06b40]" /> Collections
                    </h1>
                    <p className="text-gray-500 mt-1">Organize your products into meaningful categories.</p>
                </div>
                <Button onClick={handleOpenAdd} className="bg-[#c06b40] hover:bg-[#a85d35] text-white px-6">
                    <Plus className="w-4 h-4 mr-2" /> Add Collection
                </Button>
            </div>

            {/* Filters */}
            <div className="relative group max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#c06b40] transition-colors" />
                <Input 
                    placeholder="Search collections..." 
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
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Description</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 w-48 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-8 bg-white/5 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredCollections.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No collections found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCollections.map((collection: any) => (
                                    <tr key={collection._id} className="hover:bg-white/1 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-white">{collection.name}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant="secondary" className="bg-white/5 text-gray-400 border-none font-mono text-[10px]">
                                                {collection.slug}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm hidden md:table-cell max-w-xs truncate">
                                            {collection.description || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                                                    onClick={() => handleOpenEdit(collection)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                                                    onClick={() => {
                                                        setSelectedCollection(collection);
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
                        <DialogTitle>{selectedCollection ? "Edit Collection" : "Add New Collection"}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Provide the details for the collection below.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="space-y-2">
                            <FormFieldLabel label="Collection Image" tooltip="A featured image for this category." />
                            <ImgBBUploader 
                                value={formData.imageUrl} 
                                onChange={(url) => setFormData({ ...formData, imageUrl: url })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <FormFieldLabel label="Collection Name" tooltip="The public title of this group (e.g. 'Pure Attars')." required />
                            <Input 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-black border-white/5 focus:border-[#c06b40]/50 h-10"
                                placeholder="e.g. Attar"
                            />
                            <p className="text-[10px] text-gray-500 ml-1">Tip: Keep it short and catchy for the navigation menu.</p>
                        </div>
                        <div className="space-y-2">
                             <FormFieldLabel label="Slug" tooltip="URL identifier. Auto-generated if left blank." />
                            <Input 
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="bg-black border-white/5 focus:border-[#c06b40]/50 font-mono text-sm h-10"
                                placeholder="e.g. attar-perfumes"
                            />
                            <p className="text-[10px] text-gray-500 ml-1 italic">salaf.com/collections/{formData.slug || '...'}</p>
                        </div>
                        <div className="space-y-2">
                            <FormFieldLabel label="Description" tooltip="A brief summary for customers (optional)." />
                            <textarea 
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black border border-white/5 focus:border-[#c06b40]/50 outline-none rounded-lg p-3 text-sm text-white transition-all resize-none"
                                placeholder="Short description..."
                            />
                            <p className="text-[10px] text-gray-500 ml-1">This text may appear on the collection's landing page.</p>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isCreating || isUpdating} className="bg-[#c06b40] hover:bg-[#a85d35] text-white min-w-[100px]">
                                {isCreating || isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (selectedCollection ? "Save Changes" : "Create")}
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
                        <AlertDialogTitle>Delete Collection?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete <span className="text-white font-medium">"{selectedCollection?.name}"</span>? 
                            This action cannot be undone and may affect products associated with this collection.
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
