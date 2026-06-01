import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

/**
 * Custom hook for fetching all product collections.
 * 
 * @returns A query object containing the list of collections.
 */
export const useCollections = () => {
    return useQuery({
        queryKey: ['collections'],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/admin/collections');
            return data;
        }
    });
};

/**
 * Hook for fetching a single collection by ID.
 * 
 * @param id - The ID of the collection to fetch.
 * @returns Query state for the requested collection.
 */
export const useCollection = (id: string) => {
    return useQuery({
        queryKey: ['collections', id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/admin/collections/${id}`);
            return data;
        },
        enabled: !!id
    });
};

/**
 * Hook for creating a new product collection.
 * 
 * @returns Mutation state for collection creation.
 */
export const useCreateCollection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { name: string; slug?: string; description?: string; imageUrl?: string }) => {
            const { data } = await axiosInstance.post('/admin/collections', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collections'] });
        }
    });
};

/**
 * Hook for updating an existing collection's details.
 * 
 * @returns Mutation state for collection updates.
 */
export const useUpdateCollection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { data: responseData } = await axiosInstance.put(`/admin/collections/${id}`, data);
            return responseData;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['collections'] });
            queryClient.invalidateQueries({ queryKey: ['collections', id] });
        }
    });
};

/**
 * Hook for deleting a product collection.
 * 
 * @returns Mutation state for collection deletion.
 */
export const useDeleteCollection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await axiosInstance.delete(`/admin/collections/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collections'] });
        }
    });
};

/**
 * Custom hook for fetching all product tags.
 * 
 * @returns A query object containing the list of tags.
 */
export const useTags = () => {
    return useQuery({
        queryKey: ['tags'],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/admin/tags');
            return data;
        }
    });
};

/**
 * Hook for fetching a single tag by ID.
 * 
 * @param id - The ID of the tag to fetch.
 * @returns Query state for the requested tag.
 */
export const useTag = (id: string) => {
    return useQuery({
        queryKey: ['tags', id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/admin/tags/${id}`);
            return data;
        },
        enabled: !!id
    });
};

/**
 * Hook for creating a new product tag.
 * 
 * @returns Mutation state for tag creation.
 */
export const useCreateTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { name: string; slug?: string }) => {
            const { data } = await axiosInstance.post('/admin/tags', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        }
    });
};

/**
 * Hook for updating an existing product tag.
 * 
 * @returns Mutation state for tag updates.
 */
export const useUpdateTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { data: responseData } = await axiosInstance.put(`/admin/tags/${id}`, data);
            return responseData;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            queryClient.invalidateQueries({ queryKey: ['tags', id] });
        }
    });
};

/**
 * Hook for deleting a product tag.
 * 
 * @returns Mutation state for tag deletion.
 */
export const useDeleteTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await axiosInstance.delete(`/admin/tags/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        }
    });
};

