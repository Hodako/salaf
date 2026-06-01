"use client";

import { useProduct, useUpdateProduct } from "@/hooks/useAdminProducts";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditProductPage() {
    const router = useRouter();
    const { id } = useParams();
    const { data: product, isLoading } = useProduct(id as string);
    const { mutateAsync: updateProduct, isPending } = useUpdateProduct();

    const handleSubmit = async (data: any) => {
        try {
            await updateProduct({ id: id as string, data });
            toast.success("Product updated successfully!");
            router.push("/admin/products");
        } catch (error: any) {
            toast.error(error.message || "Failed to update product");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#c06b40]" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-gray-400">Product not found.</p>
                <button onClick={() => router.back()} className="text-[#c06b40] hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <ProductForm 
            title={`Edit Product: ${product.name}`}
            initialData={product}
            onSubmit={handleSubmit}
            isPending={isPending}
        />
    );
}
