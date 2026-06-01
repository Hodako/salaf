import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
    useAdminCoupons, 
    useCreateCoupon, 
    useUpdateCoupon, 
    useDeleteCoupon 
} from '../useAdminCoupons';
import { 
    useGetCouponsQuery, 
    useCreateCouponMutation, 
    useUpdateCouponMutation, 
    useDeleteCouponMutation 
} from '@/store/api/adminApi';

vi.mock('@/store/api/adminApi', () => ({
    useGetCouponsQuery: vi.fn(),
    useCreateCouponMutation: vi.fn(),
    useUpdateCouponMutation: vi.fn(),
    useDeleteCouponMutation: vi.fn(),
}));

describe('useAdminCoupons hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('useAdminCoupons', () => {
        it('should call useGetCouponsQuery', () => {
            (useGetCouponsQuery as any).mockReturnValue({ data: [], isLoading: false });
            renderHook(() => useAdminCoupons());
            expect(useGetCouponsQuery).toHaveBeenCalled();
        });
    });

    describe('useCreateCoupon', () => {
        it('should call useCreateCouponMutation and return wrapped mutateAsync', async () => {
            const mockTrigger = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve({ id: '1' }) });
            (useCreateCouponMutation as any).mockReturnValue([mockTrigger, { isLoading: false, isSuccess: false }]);
            
            const { result } = renderHook(() => useCreateCoupon());
            
            await act(async () => {
                const res = await result.current.mutateAsync({ code: 'TEST' });
                expect(res).toEqual({ id: '1' });
            });
            
            expect(mockTrigger).toHaveBeenCalledWith({ code: 'TEST' });
        });
    });

    describe('useUpdateCoupon', () => {
        it('should call useUpdateCouponMutation and return wrapped mutateAsync', async () => {
            const mockTrigger = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve({ success: true }) });
            (useUpdateCouponMutation as any).mockReturnValue([mockTrigger, { isLoading: false, isSuccess: false }]);
            
            const { result } = renderHook(() => useUpdateCoupon());
            
            await act(async () => {
                const res = await result.current.mutateAsync({ id: '123', code: 'UPDATED' });
                expect(res).toEqual({ success: true });
            });
            
            expect(mockTrigger).toHaveBeenCalledWith({ id: '123', code: 'UPDATED' });
        });
    });

    describe('useDeleteCoupon', () => {
        it('should call useDeleteCouponMutation and return wrapped mutateAsync', async () => {
            const mockTrigger = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve({ success: true }) });
            (useDeleteCouponMutation as any).mockReturnValue([mockTrigger, { isLoading: false, isSuccess: false }]);
            
            const { result } = renderHook(() => useDeleteCoupon());
            
            await act(async () => {
                const res = await result.current.mutateAsync('123');
                expect(res).toEqual({ success: true });
            });
            
            expect(mockTrigger).toHaveBeenCalledWith('123');
        });
    });
});
