import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { adminApi } from '../adminApi';
import { ClientCoupon } from '@/types';

const mockCoupon: ClientCoupon = {
    _id: "idx1",
    code: "SUMMER",
    discountType: "percentage",
    discountValue: 10,
    validFrom: new Date(),
    validUntil: new Date(),
    usedCount: 0,
    isActive: true,
} as any;

describe('adminApi', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({
            reducer: { [adminApi.reducerPath]: adminApi.reducer },
            middleware: (gDM) => gDM({ serializableCheck: false }).concat(adminApi.middleware),
        });
        global.fetch = vi.fn() as any;
    });

    it('fetches multi-layered dashboard metrics dynamically', async () => {
        const mockMetrics = { totalRevenue: 5000, totalOrders: 100, activeUsers: 50, recentOrders: [], salesData: [] };
        (global.fetch as any).mockResolvedValueOnce(
            new Response(JSON.stringify(mockMetrics), {
                status: 200,
                headers: new Headers({ 'Content-Type': 'application/json' }),
            })
        );
        const result = await store.dispatch(adminApi.endpoints.getDashboardMetrics.initiate());
        expect(result.data).toBeDefined();
        if (result.data) {
            expect(result.data.totalRevenue).toBe(5000);
            expect(result.data.activeUsers).toBe(50);
        }
        const fetchCall = (global.fetch as any).mock.calls[0][0] as Request;
        expect(fetchCall.url).toContain('/api/admin/dashboard');
    });

    it('fetches admin coupons to populate the management table', async () => {
        (global.fetch as any).mockResolvedValueOnce(
            new Response(JSON.stringify([mockCoupon]), {
                status: 200,
                headers: new Headers({ 'Content-Type': 'application/json' }),
            })
        );
        const result = await store.dispatch(adminApi.endpoints.getCoupons.initiate());
        expect(result.data).toBeDefined();
        if (result.data) {
            expect(result.data[0].code).toBe('SUMMER');
        }
    });

    it('executes coupon creation dispatch securely', async () => {
        (global.fetch as any).mockResolvedValueOnce(
            new Response(JSON.stringify(mockCoupon), {
                status: 200,
                headers: new Headers({ 'Content-Type': 'application/json' }),
            })
        );
        const result = await store.dispatch(adminApi.endpoints.createCoupon.initiate({ code: 'SUMMER' }));
        expect(result.data).toBeDefined();
        if ('data' in result && result.data) {
            expect(result.data.code).toBe('SUMMER');
        }
        const fetchCall = (global.fetch as any).mock.calls[0][0] as Request;
        expect(fetchCall.url).toContain('/api/admin/coupons');
        expect(fetchCall.method).toBe('POST');
    });
    
    it('executes coupon status toggle mutation accurately', async () => {
        (global.fetch as any).mockResolvedValueOnce(
            new Response(JSON.stringify({ ...mockCoupon, isActive: false }), {
                status: 200,
                headers: new Headers({ 'Content-Type': 'application/json' }),
            })
        );
        const result = await store.dispatch(adminApi.endpoints.toggleCouponStatus.initiate({ id: 'idx1', isActive: false }));
        expect(result.data).toBeDefined();
        if ('data' in result && result.data) {
            expect(result.data.isActive).toBe(false);
        }
        const fetchCall = (global.fetch as any).mock.calls[0][0] as Request;
        expect(fetchCall.url).toContain('/api/admin/coupons/idx1');
        expect(fetchCall.method).toBe('PATCH');
    });
});
