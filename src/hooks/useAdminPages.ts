import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

/**
 * Custom hook for managing CMS pages and templates in the admin panel.
 * 
 * Provides operations for fetching, creating, updating, and deleting pages.
 * Also handles template-specific logic for product and shop templates.
 * 
 * @returns An object containing pages, loading state, and page management functions.
 */
export const useAdminPages = () => {
    return useQuery<any[], Error>({
        queryKey: ['adminPages'],
        queryFn: async () => {
            const { data } = await api.get('/admin/pages');
            return data;
        },
    });
};

/**
 * Hook for fetching a single page by its ID.
 * 
 * @param id - The ID of the page to fetch. Use 'create' for new page initialization.
 * @returns Query state for the requested page.
 */
export const usePage = (id: string) => {
    return useQuery<any, Error>({
        queryKey: ['adminPages', id],
        queryFn: async () => {
            if (id === 'create') return null;
            const { data } = await api.get(`/admin/pages/${id}`);
            return data;
        },
        enabled: !!id && id !== 'create',
    });
};

/**
 * Hook for creating a new CMS page.
 * 
 * @returns Mutation state for page creation.
 */
export const useCreatePage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (pageData: any) => {
            const { data } = await api.post('/admin/pages', pageData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPages'] });
        },
    });
};

/**
 * Hook for updating an existing CMS page.
 * 
 * @returns Mutation state for page updates.
 */
export const useUpdatePage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data: pageData }: { id: string; data: any }) => {
            const { data } = await api.put(`/admin/pages/${id}`, pageData);
            return data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['adminPages'] });
            queryClient.invalidateQueries({ queryKey: ['adminPages', id] });
        },
    });
};

/**
 * Hook for deleting a CMS page.
 * 
 * @returns Mutation state for page deletion.
 */
export const useDeletePage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/admin/pages/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPages'] });
        },
    });
};

