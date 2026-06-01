import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { 
    useCollections, 
    useCollection, 
    useCreateCollection, 
    useUpdateCollection, 
    useDeleteCollection,
    useTags,
    useTag,
    useCreateTag,
    useUpdateTag,
    useDeleteTag
} from '../useTaxonomy';
import axiosInstance from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

vi.mock('@/lib/axios');
vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
}));

describe('useTaxonomy hooks', () => {
    const mockQueryClient = {
        invalidateQueries: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useQueryClient as any).mockReturnValue(mockQueryClient);
    });

    describe('useCollections', () => {
        it('should call useQuery with correct params', () => {
            (useQuery as any).mockReturnValue({ data: [] });
            renderHook(() => useCollections());
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['collections']
            }));
        });
    });

    describe('useCollection', () => {
        it('should call useQuery with correct params', () => {
            (useQuery as any).mockReturnValue({ data: {} });
            renderHook(() => useCollection('123'));
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['collections', '123'],
                enabled: true
            }));
        });
    });

    describe('useCreateCollection', () => {
        it('should call useMutation with correct params', async () => {
            (useMutation as any).mockReturnValue({ mutate: vi.fn() });
            renderHook(() => useCreateCollection());
            const mutationCall = (useMutation as any).mock.calls.find((call: any) => typeof call[0].mutationFn === 'function');
            expect(mutationCall).toBeDefined();
            
            const payload = { name: 'Test' };
            (axiosInstance.post as any).mockResolvedValue({ data: { id: '1' } });
            await mutationCall[0].mutationFn(payload);
            expect(axiosInstance.post).toHaveBeenCalledWith('/admin/collections', payload);
            
            mutationCall[0].onSuccess();
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['collections'] });
        });
    });

    describe('useUpdateCollection', () => {
        it('should call useMutation with correct params', async () => {
            (useMutation as any).mockReturnValue({ mutate: vi.fn() });
            renderHook(() => useUpdateCollection());
            const mutationCall = (useMutation as any).mock.calls.find((call: any) => typeof call[0].mutationFn === 'function');
            
            const payload = { id: '123', data: { name: 'Updated' } };
            (axiosInstance.put as any).mockResolvedValue({ data: { success: true } });
            await mutationCall[0].mutationFn(payload);
            expect(axiosInstance.put).toHaveBeenCalledWith('/admin/collections/123', payload.data);
            
            mutationCall[0].onSuccess(null, { id: '123' });
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['collections'] });
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['collections', '123'] });
        });
    });

    describe('useDeleteCollection', () => {
        it('should call useMutation and invalidate queries', async () => {
            (useMutation as any).mockReturnValue({ mutate: vi.fn() });
            renderHook(() => useDeleteCollection());
            const mutationCall = (useMutation as any).mock.calls.find((call: any) => typeof call[0].mutationFn === 'function');
            
            (axiosInstance.delete as any).mockResolvedValue({ data: { success: true } });
            await mutationCall[0].mutationFn('123');
            expect(axiosInstance.delete).toHaveBeenCalledWith('/admin/collections/123');
            
            mutationCall[0].onSuccess();
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['collections'] });
        });
    });

    describe('useTags', () => {
        it('should call useQuery with correct params', () => {
            (useQuery as any).mockReturnValue({ data: [] });
            renderHook(() => useTags());
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['tags']
            }));
        });
    });

    describe('useTag', () => {
        it('should call useQuery with correct params', () => {
            (useQuery as any).mockReturnValue({ data: {} });
            renderHook(() => useTag('123'));
            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['tags', '123'],
                enabled: true
            }));
        });
    });

    describe('useCreateTag', () => {
        it('should call useMutation and invalidate queries', async () => {
            (useMutation as any).mockReturnValue({ mutate: vi.fn() });
            renderHook(() => useCreateTag());
            const mutationCall = (useMutation as any).mock.calls.find((call: any) => typeof call[0].mutationFn === 'function');
            
            const payload = { name: 'Tag' };
            (axiosInstance.post as any).mockResolvedValue({ data: { id: '1' } });
            await mutationCall[0].mutationFn(payload);
            expect(axiosInstance.post).toHaveBeenCalledWith('/admin/tags', payload);
            
            mutationCall[0].onSuccess();
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tags'] });
        });
    });

    describe('useUpdateTag', () => {
        it('should call useMutation and invalidate queries', async () => {
            (useMutation as any).mockReturnValue({ mutate: vi.fn() });
            renderHook(() => useUpdateTag());
            const mutationCall = (useMutation as any).mock.calls.find((call: any) => typeof call[0].mutationFn === 'function');
            
            const payload = { id: '123', data: { name: 'Updated' } };
            (axiosInstance.put as any).mockResolvedValue({ data: { success: true } });
            await mutationCall[0].mutationFn(payload);
            expect(axiosInstance.put).toHaveBeenCalledWith('/admin/tags/123', payload.data);
            
            mutationCall[0].onSuccess(null, { id: '123' });
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tags'] });
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tags', '123'] });
        });
    });

    describe('useDeleteTag', () => {
        it('should call useMutation and invalidate queries', async () => {
            (useMutation as any).mockReturnValue({ mutate: vi.fn() });
            renderHook(() => useDeleteTag());
            const mutationCall = (useMutation as any).mock.calls.find((call: any) => typeof call[0].mutationFn === 'function');
            
            (axiosInstance.delete as any).mockResolvedValue({ data: { success: true } });
            await mutationCall[0].mutationFn('123');
            expect(axiosInstance.delete).toHaveBeenCalledWith('/admin/tags/123');
            
            mutationCall[0].onSuccess();
            expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['tags'] });
        });
    });
});
