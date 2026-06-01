import { useGetDashboardMetricsQuery } from '@/store/api/adminApi';

/**
 * Custom hook for fetching and managing admin dashboard statistics.
 * 
 * Provides high-level metrics like total sales, order counts, and user statistics.
 * 
 * @returns An object containing dashboard stats and loading/error states.
 */
export const useAdminDashboard = () => {
    return useGetDashboardMetricsQuery();
};
