import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

/**
 * Custom hook for managing products in the admin panel.
 * 
 * Provides CRUD operations for products, including fetching, creating, 
 * updating, and deleting products. It also provides search and pagination state.
 * 
 * @returns An object containing products, loading state, and product management functions.
 */
export const useAdminProducts = () => {
    return useQuery<any[], Error>({
        queryKey: ['adminProducts'],
        queryFn: async () => {
            const { data } = await api.get('/admin/products');
            return data;
        },
    });
};

/**
 * Hook for fetching a single product's full details by ID.
 * 
 * @param id - The ID of the product to fetch.
 * @returns Query state for the requested product.
 */
export const useProduct = (id: string) => {
    return useQuery<any, Error>({
        queryKey: ['adminProducts', id],
        queryFn: async () => {
            const { data } = await api.get(`/admin/products/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

/**
 * Hook for creating a new product listing.
 * 
 * @returns Mutation state for product creation.
 */
export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (productData: any) => {
            const { data } = await api.post('/admin/products', productData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        },
    });
};

/**
 * Hook for updating an existing product's information.
 * 
 * @returns Mutation state for product updates.
 */
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data: productData }: { id: string; data: any }) => {
            const { data } = await api.put(`/admin/products/${id}`, productData);
            return data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
            queryClient.invalidateQueries({ queryKey: ['adminProducts', id] });
        },
    });
};

/**
 * Hook for deleting a product listing.
 * 
 * @returns Mutation state for product deletion.
 */
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/admin/products/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        },
    });
};

