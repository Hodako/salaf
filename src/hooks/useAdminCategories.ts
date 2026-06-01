import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

/**
 * Custom hook for fetching all product categories.
 * 
 * @returns A query object containing the list of categories.
 */
export const useAdminCategories = () => {
    return useQuery({
        queryKey: ['admin-categories'],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/admin/categories');
            return data;
        }
    });
};

/**
 * Hook for fetching a single category by ID.
 * 
 * @param id - The ID of the category to fetch.
 * @returns Query state for the requested category.
 */
export const useAdminCategory = (id: string) => {
    return useQuery({
        queryKey: ['admin-categories', id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/admin/categories/${id}`);
            return data;
        },
        enabled: !!id
    });
};

/**
 * Hook for creating a new product category.
 * 
 * @returns Mutation state for category creation.
 */
export const useCreateAdminCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { name: string; slug?: string; description?: string; imageUrl?: string; parent?: string | null }) => {
            const { data } = await axiosInstance.post('/admin/categories', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        }
    });
};

/**
 * Hook for updating an existing category's details.
 * 
 * @returns Mutation state for category updates.
 */
export const useUpdateAdminCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { data: responseData } = await axiosInstance.put(`/admin/categories/${id}`, data);
            return responseData;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            queryClient.invalidateQueries({ queryKey: ['admin-categories', id] });
        }
    });
};

/**
 * Hook for deleting a product category.
 * 
 * @returns Mutation state for category deletion.
 */
export const useDeleteAdminCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await axiosInstance.delete(`/admin/categories/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        }
    });
};
