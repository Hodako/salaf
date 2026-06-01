import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { 
    useDeliveryZones, 
    useCreateDeliveryZone, 
    useUpdateDeliveryZone, 
    useDeleteDeliveryZone 
} from '../useDeliveryZones';
import api from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

vi.mock('@/lib/axios');
vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
}));

describe('useDeliveryZones hooks', () => {
    const mockQueryClient = {
        invalidateQueries: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useQueryClient as any).mockReturnValue(mockQueryClient);
    });

    describe('useDeliveryZones', () => {
        it('should call useQuery with correct params', () => {
            (useQuery as any).mockReturnValue({ data: [] });
            renderHook(() => useDeliveryZones());
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['delivery-zones']
            }));
        });
    });

    describe('useCreateDeliveryZone', () => {
        it('should call useMutation and invalidate queries', async () => {
            (useMutation as any).mockReturnValue({ mutate: vi.fn() });
            renderHook(() => useCreateDeliveryZone());
            const mutationCall = (useMutation as any).mock.calls.find((call: any) => typeof call[0].mutationFn === 'function');
            
            const payload = { name: 'Zone' };
            (api.post as any).mockResolvedValue({ data: { id: '1' } });
            await mutationCall[0].mutationFn(payload);
            expect(api.post).toHaveBeenCalledWith('/admin/delivery-zones', payload);
            
            mutationCall[0].onSuccess();
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['delivery-zones'] });
        });
    });

    describe('useUpdateDeliveryZone', () => {
        it('should call useMutation and invalidate queries', async () => {
            (useMutation as any).mockReturnValue({ mutate: vi.fn() });
            renderHook(() => useUpdateDeliveryZone());
            const mutationCall = (useMutation as any).mock.calls.find((call: any) => typeof call[0].mutationFn === 'function');
            
            const payload = { id: '123', data: { name: 'Updated Zone' } };
            (api.put as any).mockResolvedValue({ data: { success: true } });
            await mutationCall[0].mutationFn(payload);
            expect(api.put).toHaveBeenCalledWith('/admin/delivery-zones/123', payload.data);
            
            mutationCall[0].onSuccess();
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['delivery-zones'] });
        });
    });

    describe('useDeleteDeliveryZone', () => {
        it('should call useMutation and invalidate queries', async () => {
            (useMutation as any).mockReturnValue({ mutate: vi.fn() });
            renderHook(() => useDeleteDeliveryZone());
            const mutationCall = (useMutation as any).mock.calls.find((call: any) => typeof call[0].mutationFn === 'function');
            
            (api.delete as any).mockResolvedValue({ data: { success: true } });
            await mutationCall[0].mutationFn('123');
            expect(api.delete).toHaveBeenCalledWith('/admin/delivery-zones/123');
            
            mutationCall[0].onSuccess();
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['delivery-zones'] });
        });
    });
});
