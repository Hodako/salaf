import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

/**
 * Custom hook for managing brands in the admin panel.
 */
export const useAdminBrands = () => {
    return useQuery<any[], Error>({
        queryKey: ['adminBrands'],
        queryFn: async () => {
            const { data } = await api.get('/admin/brands');
            return data;
        },
    });
};

/**
 * Hook for fetching a single brand's details by ID.
 */
export const useBrand = (id: string) => {
    return useQuery<any, Error>({
        queryKey: ['adminBrands', id],
        queryFn: async () => {
            const { data } = await api.get(`/admin/brands/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

/**
 * Hook for creating a new brand.
 */
export const useCreateBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (brandData: any) => {
            const { data } = await api.post('/admin/brands', brandData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBrands'] });
        },
    });
};

/**
 * Hook for updating an existing brand.
 */
export const useUpdateBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data: brandData }: { id: string; data: any }) => {
            const { data } = await api.put(`/admin/brands/${id}`, brandData);
            return data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['adminBrands'] });
            queryClient.invalidateQueries({ queryKey: ['adminBrands', id] });
        },
    });
};

/**
 * Hook for deleting a brand.
 */
export const useDeleteBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/admin/brands/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBrands'] });
        },
    });
};
