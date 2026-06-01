import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

/**
 * Custom hook for accessing application-wide settings.
 * 
 * Fetches settings from the backend and provides a convenient way to 
 * retrieve specific configuration values by key.
 * 
 * @returns An object containing all settings, loading state, and a getter function.
 */
export const useSettings = () => {
    return useQuery<Record<string, any>, Error>({
        queryKey: ['settings'],
        queryFn: async () => {
            const { data } = await api.get('/admin/settings');
            return data;
        },
    });
};

/**
 * Hook for updating global application settings.
 * 
 * @returns Mutation state for bulk settings update.
 */
export const useUpdateSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: Record<string, any>) => {
            const { data } = await api.post('/admin/settings', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });
};

