import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { 
    useAdminProducts, 
    useProduct, 
    useCreateProduct, 
    useUpdateProduct, 
    useDeleteProduct 
} from '../useAdminProducts';
import api from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

vi.mock('@/lib/axios');
vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
}));

describe('useAdminProducts hooks', () => {
    const mockQueryClient = {
        invalidateQueries: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useQueryClient as any).mockReturnValue(mockQueryClient);
    });

    describe('useAdminProducts', () => {
        it('should call useQuery with correct params', () => {
            (useQuery as any).mockReturnValue({ data: [] });
            renderHook(() => useAdminProducts());
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['adminProducts']
            }));
        });
    });

    describe('useProduct', () => {
        it('should call useQuery with correct params', () => {
            (useQuery as any).mockReturnValue({ data: {} });
            renderHook(() => useProduct('123'));
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['adminProducts', '123'],
                enabled: true
            }));
        });
    });

    describe('useCreateProduct', () => {
        it('should call useMutation and invalidate queries', async () => {
            (useMutation as any).mockReturnValue({ mutate: vi.fn() });
            renderHook(() => useCreateProduct());
            const mutationCall = (useMutation as any).mock.calls.find((call: any) => typeof call[0].mutationFn === 'function');
            
            const payload = { name: 'New Product' };
            (api.post as any).mockResolvedValue({ data: { id: '1' } });
            await mutationCall[0].mutationFn(payload);
            expect(api.post).toHaveBeenCalledWith('/admin/products', payload);
            
            mutationCall[0].onSuccess();
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['adminProducts'] });
        });
    });

    describe('useUpdateProduct', () => {
        it('should call useMutation and invalidate queries', async () => {
            (useMutation as any).mockReturnValue({ mutate: vi.fn() });
            renderHook(() => useUpdateProduct());
            const mutationCall = (useMutation as any).mock.calls.find((call: any) => typeof call[0].mutationFn === 'function');
            
            const payload = { id: '123', data: { name: 'Updated Product' } };
            (api.put as any).mockResolvedValue({ data: { success: true } });
            await mutationCall[0].mutationFn(payload);
            expect(api.put).toHaveBeenCalledWith('/admin/products/123', payload.data);
            
            mutationCall[0].onSuccess(null, { id: '123' });
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['adminProducts'] });
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['adminProducts', '123'] });
        });
    });

    describe('useDeleteProduct', () => {
        it('should call useMutation and invalidate queries', async () => {
            (useMutation as any).mockReturnValue({ mutate: vi.fn() });
            renderHook(() => useDeleteProduct());
            const mutationCall = (useMutation as any).mock.calls.find((call: any) => typeof call[0].mutationFn === 'function');
            
            (api.delete as any).mockResolvedValue({ data: { success: true } });
            await mutationCall[0].mutationFn('123');
            expect(api.delete).toHaveBeenCalledWith('/admin/products/123');
            
            mutationCall[0].onSuccess();
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['adminProducts'] });
        });
    });
});
