"use client";

import { useState } from "react";
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    FolderTree,
    Loader2,
    AlertCircle,
    ChevronRight,
    CornerDownRight
} from "lucide-react";
import { 
    useAdminCategories, 
    useCreateAdminCategory, 
    useUpdateAdminCategory, 
    useDeleteAdminCategory 
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

export default function CategoriesPage() {
    const { data: categories = [], isLoading } = useAdminCategories();
    const { mutateAsync: createCategory, isPending: isCreating } = useCreateAdminCategory();
    const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateAdminCategory();
    const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteAdminCategory();

    const [searchQuery, setSearchQuery] = useState("");
    const [levelFilter, setLevelFilter] = useState<string>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [formData, setFormData] = useState({ name: "", slug: "", description: "", imageUrl: "", parent: "" });

    const filteredCategories = categories.filter((c: any) => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              c.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = levelFilter === "all" || c.level.toString() === levelFilter;
        return matchesSearch && matchesLevel;
    });

    // Helper to get parent category name
    const getParentName = (parentId: string) => {
        if (!parentId) return "—";
        const parent = categories.find((c: any) => c._id === parentId);
        return parent ? parent.name : "Unknown Parent";
    };

    // Filter available parents: only level 0 and level 1 categories, and NOT the current editing category
    const availableParents = categories.filter((c: any) => {
        if (selectedCategory && c._id === selectedCategory._id) return false;
        return c.level < 2; // only Root and Subcategories can be parents
    });

    const handleOpenAdd = () => {
        setSelectedCategory(null);
        setFormData({ name: "", slug: "", description: "", imageUrl: "", parent: "" });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (category: any) => {
        setSelectedCategory(category);
        setFormData({ 
            name: category.name, 
            slug: category.slug, 
            description: category.description || "",
            imageUrl: category.imageUrl || "",
            parent: category.parent || ""
        });
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                parent: formData.parent === "" ? null : formData.parent
            };

            if (selectedCategory) {
                await updateCategory({ id: selectedCategory._id, data: payload });
                toast.success("Category updated successfully");
            } else {
                await createCategory(payload);
                toast.success("Category created successfully");
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.response?.data?.error || "Something went wrong");
        }
    };

    const handleDelete = async () => {
        if (!selectedCategory) return;
        try {
            await deleteCategory(selectedCategory._id);
            toast.success("Category deleted successfully");
            setIsDeleteDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to delete category");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <FolderTree className="w-8 h-8 text-[#c06b40]" /> Categories
                    </h1>
                    <p className="text-gray-500 mt-1">Manage your store's hierarchical product structure (Root $\rightarrow$ Sub $\rightarrow$ Child).</p>
                </div>
                <Button onClick={handleOpenAdd} className="bg-[#c06b40] hover:bg-[#a85d35] text-white px-6">
                    <Plus className="w-4 h-4 mr-2" /> Add Category
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#c06b40] transition-colors" />
                    <Input 
                        placeholder="Search categories..." 
                        className="pl-10 bg-[#111] border-white/5 focus:border-[#c06b40]/50 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Level Filter</span>
                    <select
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className="bg-[#111] border border-white/5 rounded-md px-4 py-2 text-white h-10 focus:outline-none focus:border-[#c06b40]/50 transition-colors text-sm"
                    >
                        <option value="all">All Levels</option>
                        <option value="0">Root Categories (L0)</option>
                        <option value="1">Subcategories (L1)</option>
                        <option value="2">Sub-subcategories (L2)</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/2">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Slug</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Hierarchy Level</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Parent Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-8 bg-white/5 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category: any) => (
                                    <tr key={category._id} className="hover:bg-white/1 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                            {category.level === 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
                                            {category.level === 2 && <CornerDownRight className="w-3.5 h-3.5 text-gray-600 ml-2" />}
                                            {category.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="secondary" className="bg-white/5 text-gray-400 border-none font-mono text-[10px]">
                                                {category.slug}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            {category.level === 0 && <Badge className="bg-blue-500/10 text-blue-400 border-none">Root Category</Badge>}
                                            {category.level === 1 && <Badge className="bg-emerald-500/10 text-emerald-400 border-none">Subcategory</Badge>}
                                            {category.level === 2 && <Badge className="bg-purple-500/10 text-purple-400 border-none">Sub-subcat</Badge>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {getParentName(category.parent)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                                                    onClick={() => handleOpenEdit(category)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                                                    onClick={() => {
                                                        setSelectedCategory(category);
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
                        <DialogTitle>{selectedCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Provide the details for the category below.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="space-y-2">
                            <FormFieldLabel label="Category Image" tooltip="A featured banner/image for this category." />
                            <ImgBBUploader 
                                value={formData.imageUrl} 
                                onChange={(url) => setFormData({ ...formData, imageUrl: url })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <FormFieldLabel label="Category Name" tooltip="The public title of this category (e.g. 'Honey')." required />
                            <Input 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-black border-white/5 focus:border-[#c06b40]/50 h-10"
                                placeholder="e.g. Honey & Ghee"
                            />
                        </div>
                        <div className="space-y-2">
                             <FormFieldLabel label="Slug" tooltip="URL identifier. Auto-generated if left blank." />
                            <Input 
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="bg-black border-white/5 focus:border-[#c06b40]/50 font-mono text-sm h-10"
                                placeholder="e.g. honey-and-ghee"
                            />
                        </div>
                        <div className="space-y-2">
                            <FormFieldLabel label="Parent Category (Optional)" tooltip="Select a parent category if this is a subcategory or sub-subcategory." />
                            <select
                                value={formData.parent}
                                onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                                className="w-full bg-black border border-white/5 rounded-md px-4 py-2 text-white h-10 focus:outline-none focus:border-[#c06b40]/50 transition-colors text-sm"
                            >
                                <option value="">None (Root Category)</option>
                                {availableParents.map((c: any) => (
                                    <option key={c._id} value={c._id}>
                                        {c.level === 1 ? "↳ " : ""}{c.name} (L{c.level})
                                    </option>
                                ))}
                            </select>
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
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isCreating || isUpdating} className="bg-[#c06b40] hover:bg-[#a85d35] text-white min-w-[100px]">
                                {isCreating || isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (selectedCategory ? "Save Changes" : "Create")}
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
                        <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete <span className="text-white font-medium">"{selectedCategory?.name}"</span>? 
                            This action cannot be undone and will fail if there are active subcategories underneath this item.
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
