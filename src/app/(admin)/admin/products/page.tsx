"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Loader2, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAdminProducts, useDeleteProduct } from "@/hooks/useAdminProducts";
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

export default function AdminProductsPage() {
    const { data: products = [], isLoading, error } = useAdminProducts();
    const { mutateAsync: deleteProduct } = useDeleteProduct();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        try {
            await deleteProduct(id);
            toast.success("Product deleted successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete product");
        } finally {
            setDeletingId(null);
        }
    };

    const getPriceRange = (variations: any[]) => {
        if (!variations || variations.length === 0) return "N/A";
        const prices = variations.map(v => v.salePrice || v.basePrice);
        const min = Math.min(...prices);
        const max = Math.max(...prices);

        if (min === max) return `৳${min}`;
        return `৳${min} - ৳${max}`;
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-medium tracking-wide text-white mb-2">Products</h1>
                    <p className="text-gray-400">Manage your store catalog and inventory.</p>
                </div>
                <Link href="/admin/products/create">
                    <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-6 flex items-center gap-2 font-medium">
                        <Plus className="w-5 h-5" /> Add Product
                    </Button>
                </Link>
            </div>

            {/* List Area */}
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="p-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#c06b40]" />
                    </div>
                ) : error ? (
                    <div className="p-12 text-center text-red-400">
                        <p>Failed to load products.</p>
                        <p className="text-sm opacity-70 mt-2">{(error as any).message}</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-gray-500 text-center">
                        <Package className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg text-white mb-2">No products found</p>
                        <p className="text-sm mb-6">Start by adding your first product.</p>
                        <Link href="/admin/products/create" className="text-[#c06b40] font-medium hover:underline">
                            Add Product
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/2">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">SKU Prefix</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Variants</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Price</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {products.map((product: any) => (
                                    <tr key={product._id} className="hover:bg-white/1 transition-colors group border-b border-white/5">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0 relative">
                                                    {product.featuredImage ? (
                                                        <img src={product.featuredImage} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                            <Package className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-white group-hover:text-[#c06b40] transition-colors line-clamp-1">{product.name}</span>
                                                    <span className="text-xs text-gray-500 font-mono">/{product.slug}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <span className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5">
                                                {product.skuPrefix || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs text-white font-medium">{product.category?.name || "Uncategorized"}</span>
                                                {product.subcategory?.name && (
                                                    <span className="text-[10px] text-gray-500">{product.subcategory.name}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <div className="flex flex-wrap gap-1">
                                                {(product.variations || []).map((v: any, i: number) => (
                                                    <span key={i} className="text-[10px] bg-white/5 text-gray-300 px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap">
                                                        {v.volume}{v.volumeUnit}
                                                    </span>
                                                ))}
                                                {(!product.variations || product.variations.length === 0) && (
                                                    <span className="text-xs text-gray-600">No variants</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-white">{getPriceRange(product.variations)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/products/edit/${product._id}`}>
                                                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Edit Product">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </Link>
 
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-[#111] border-white/10 text-white">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="flex items-center gap-2">
                                                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                                                Are you absolutely sure?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription className="text-gray-400">
                                                                This action cannot be undone. This will permanently delete
                                                                <span className="text-white font-medium"> "{product.name}" </span>
                                                                and remove all associated data from our servers.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(product._id)}
                                                                className="bg-red-500 hover:bg-red-600 text-white"
                                                            >
                                                                Delete Product
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
                    </div>
                )}
            </div>
        </div>
    );
}
