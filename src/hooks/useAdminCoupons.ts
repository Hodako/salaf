import { 
    useGetCouponsQuery, 
    useCreateCouponMutation, 
    useUpdateCouponMutation, 
    useDeleteCouponMutation 
} from '@/store/api/adminApi';

/**
 * Custom hook for managing coupons in the admin panel.
 * 
 * Provides CRUD operations for coupons, including fetching the list, 
 * creating new coupons, and toggling coupon status.
 * 
 * @returns An object containing coupons, loading state, and coupon management functions.
 */
export const useAdminCoupons = () => {
    return useGetCouponsQuery();
};

/**
 * Hook for creating a new promotional coupon.
 * 
 * @returns Mutation execution function and state.
 */
export const useCreateCoupon = () => {
    const [trigger, result] = useCreateCouponMutation();
    return {
        ...result,
        isLoading: result.isLoading,
        isPending: result.isLoading,
        isSuccess: result.isSuccess,
        mutateAsync: async (couponPayload: any) => trigger(couponPayload).unwrap()
    };
};

/**
 * Hook for updating an existing coupon's details or status.
 * 
 * @returns Mutation execution function and state.
 */
export const useUpdateCoupon = () => {
    const [trigger, result] = useUpdateCouponMutation();
    return {
        ...result,
        isLoading: result.isLoading,
        isPending: result.isLoading,
        isSuccess: result.isSuccess,
        mutateAsync: async (payload: { id: string; [key: string]: any }) => trigger(payload).unwrap()
    };
};

/**
 * Hook for permanently deleting a coupon.
 * 
 * @returns Mutation execution function and state.
 */
export const useDeleteCoupon = () => {
    const [trigger, result] = useDeleteCouponMutation();
    return {
        ...result,
        isLoading: result.isLoading,
        isPending: result.isLoading,
        isSuccess: result.isSuccess,
        mutateAsync: async (id: string) => trigger(id).unwrap()
    };
};

