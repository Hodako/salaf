import { describe, it, expect, vi } from 'vitest';
import api from '../axios';

describe('axios api', () => {
    it('should have correct base URL', () => {
        expect(api.defaults.baseURL).toBe('/api');
    });

    it('should have correct timeout', () => {
        expect(api.defaults.timeout).toBe(10000);
    });

    it('should have correct headers', () => {
        expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('should have response interceptor that returns response', async () => {
        const response = { data: 'test' };
        // Accessing private interceptors to test
        const interceptor = (api.interceptors.response as any).handlers[0];
        const result = interceptor.fulfilled(response);
        expect(result).toBe(response);
    });

    it('should have response interceptor that rejects error', async () => {
        const error = new Error('test error');
        const interceptor = (api.interceptors.response as any).handlers[0];
        try {
            await interceptor.rejected(error);
        } catch (e) {
            expect(e).toBe(error);
        }
    });
});
