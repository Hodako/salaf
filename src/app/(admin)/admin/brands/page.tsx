"use client";

import { useState, useEffect } from "react";
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Award,
    Loader2,
    AlertCircle,
    Image as ImageIcon
} from "lucide-react";
import { 
    useAdminBrands, 
    useCreateBrand, 
    useUpdateBrand, 
    useDeleteBrand 
} from "@/hooks/useAdminBrands";
import { FormFieldLabel } from "@/components/admin/products/FormHelpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ImgBBUploader } from "@/components/admin/products/ImgBBUploader";

export default function BrandsPage() {
    const { data: brands = [], isLoading } = useAdminBrands();
    const { mutateAsync: createBrand, isPending: isCreating } = useCreateBrand();
    const { mutateAsync: updateBrand, isPending: isUpdating } = useUpdateBrand();
    const { mutateAsync: deleteBrand, isPending: isDeleting } = useDeleteBrand();

    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<any>(null);
    const [formData, setFormData] = useState({ 
        name: "", 
        slug: "", 
        logo: "", 
        description: "" 
    });

    // Auto-generate slug from name
    useEffect(() => {
        if (!selectedBrand && formData.name) {
            const generatedSlug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            setFormData(prev => ({ ...prev, slug: generatedSlug }));
        }
    }, [formData.name, selectedBrand]);

    const filteredBrands = brands.filter((b: any) => 
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenAdd = () => {
        setSelectedBrand(null);
        setFormData({ name: "", slug: "", logo: "", description: "" });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (brand: any) => {
        setSelectedBrand(brand);
        setFormData({ 
            name: brand.name, 
            slug: brand.slug,
            logo: brand.logo,
            description: brand.description || ""
        });
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.logo) {
            toast.error("Please upload a brand logo");
            return;
        }
        try {
            if (selectedBrand) {
                await updateBrand({ id: selectedBrand._id, data: formData });
                toast.success("Brand updated successfully");
            } else {
                await createBrand(formData);
                toast.success("Brand created successfully");
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    const handleDelete = async () => {
        if (!selectedBrand) return;
        try {
            await deleteBrand(selectedBrand._id);
            toast.success("Brand deleted successfully");
            setIsDeleteDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete brand");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Award className="w-8 h-8 text-[#c06b40]" /> Brands
                    </h1>
                    <p className="text-gray-500 mt-1">Manage product brands and their identity.</p>
                </div>
                <Button onClick={handleOpenAdd} className="bg-[#c06b40] hover:bg-[#a85d35] text-white px-6 shadow-lg shadow-[#c06b40]/20">
                    <Plus className="w-4 h-4 mr-2" /> Add Brand
                </Button>
            </div>

            {/* Filters */}
            <div className="relative group max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#c06b40] transition-colors" />
                <Input 
                    placeholder="Search brands..." 
                    className="pl-10 bg-[#111] border-white/5 focus:border-[#c06b40]/50 transition-all rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-6 animate-pulse">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white/5 rounded-xl" />
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-white/5 rounded" />
                                    <div className="h-3 w-16 bg-white/5 rounded" />
                                </div>
                            </div>
                            <div className="h-12 w-full bg-white/5 rounded-lg" />
                        </div>
                    ))
                ) : filteredBrands.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-[#111] border border-dashed border-white/10 rounded-3xl">
                        <Award className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-white font-medium">No brands found</h3>
                        <p className="text-gray-500 text-sm mt-1">Try adjusting your search or add a new brand.</p>
                    </div>
                ) : (
                    filteredBrands.map((brand: any) => (
                        <div key={brand._id} className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-[#c06b40]/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5 bg-black/40 backdrop-blur-sm rounded-lg"
                                    onClick={() => handleOpenEdit(brand)}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-400/10 bg-black/40 backdrop-blur-sm rounded-lg"
                                    onClick={() => {
                                        setSelectedBrand(brand);
                                        setIsDeleteDialogOpen(true);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-xl bg-black border border-white/5 p-1 overflow-hidden shrink-0">
                                    {brand.logo ? (
                                        <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <ImageIcon className="w-full h-full text-gray-700" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-white font-bold truncate pr-16">{brand.name}</h3>
                                    <Badge variant="secondary" className="bg-[#c06b40]/10 text-[#c06b40] border-none text-[9px] uppercase tracking-wider px-2 py-0">
                                        {brand.slug}
                                    </Badge>
                                </div>
                            </div>
                            
                            {brand.description && (
                                <p className="text-gray-500 text-sm line-clamp-2 mt-2 leading-relaxed">
                                    {brand.description}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-2xl p-0 overflow-hidden rounded-3xl">
                    <DialogHeader className="p-8 pb-0">
                        <DialogTitle className="text-2xl">{selectedBrand ? "Edit Brand" : "Add New Brand"}</DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Configure the brand identity and details.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <FormFieldLabel label="Brand Name" required />
                                    <Input 
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-black border-white/5 focus:border-[#c06b40]/50 h-12 rounded-xl"
                                        placeholder="e.g. Chanel"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <FormFieldLabel label="Slug" tooltip="URL identifier. Auto-generated from name but editable." />
                                    <Input 
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="bg-black border-white/5 focus:border-[#c06b40]/50 font-mono text-sm h-12 rounded-xl"
                                        placeholder="e.g. chanel"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <FormFieldLabel label="Brand Logo" required tooltip="Upload a high-quality logo for the brand." />
                                <div className="h-[128px]">
                                    <ImgBBUploader 
                                        value={formData.logo}
                                        onChange={(url) => setFormData({ ...formData, logo: url })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <FormFieldLabel label="Description" />
                            <Textarea 
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="bg-black border-white/5 focus:border-[#c06b40]/50 min-h-[100px] rounded-xl"
                                placeholder="Describe the brand's heritage or style..."
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-white rounded-xl">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating || isUpdating} className="bg-[#c06b40] hover:bg-[#a85d35] text-white min-w-[140px] h-12 rounded-xl shadow-lg shadow-[#c06b40]/20 transition-all">
                                {isCreating || isUpdating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    selectedBrand ? "Update Brand" : "Create Brand"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-[#0a0a0a] border-white/10 text-white rounded-3xl p-8">
                    <AlertDialogHeader>
                        <div className="w-14 h-14 rounded-2xl bg-red-400/10 flex items-center justify-center mb-6">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <AlertDialogTitle className="text-xl">Delete Brand?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 text-base leading-relaxed">
                            Are you sure you want to delete <span className="text-white font-semibold">"{selectedBrand?.name}"</span>? 
                            This action is permanent and will remove the brand association from all products.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3">
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-12 rounded-xl px-6">
                            Keep Brand
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white border-none h-12 rounded-xl px-6 min-w-[120px]"
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Brand"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
