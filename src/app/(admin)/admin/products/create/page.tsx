"use client";

import { useCreateProduct } from "@/hooks/useAdminProducts";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateProductPage() {
    const router = useRouter();
    const { mutateAsync: createProduct, isPending } = useCreateProduct();

    const handleSubmit = async (data: any) => {
        try {
            await createProduct(data);
            toast.success("Product created successfully!");
            router.push("/admin/products");
        } catch (error: any) {
            toast.error(error.message || "Failed to create product");
        }
    };

    return (
        <ProductForm 
            title="Add New Product"
            onSubmit={handleSubmit}
            isPending={isPending}
        />
    );
}
