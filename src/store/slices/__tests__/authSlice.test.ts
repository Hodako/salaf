import { describe, it, expect } from 'vitest';
import reducer, { setUser, clearUser, setLoading } from '../authSlice';

describe('authSlice', () => {
    it('should return initial state', () => {
        expect(reducer(undefined, { type: 'unknown' })).toEqual({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            loading: true,
        });
    });

    it('should handle setUser for customer', () => {
        const user = {
            uid: '123',
            email: 'test@test.com',
            name: 'Test',
            image: null,
            role: 'customer' as const,
        };
        const state = reducer(undefined, setUser(user));
        expect(state.user).toEqual(user);
        expect(state.isAuthenticated).toBe(true);
        expect(state.isAdmin).toBe(false);
    });

    it('should handle setUser for admin', () => {
        const user = {
            uid: '123',
            email: 'admin@test.com',
            name: 'Admin',
            image: null,
            role: 'admin' as const,
        };
        const state = reducer(undefined, setUser(user));
        expect(state.isAdmin).toBe(true);
    });

    it('should handle clearUser', () => {
        const initialState = {
            user: { uid: '123', email: 'a@a.com', name: 'A', image: null, role: 'customer' as const },
            isAuthenticated: true,
            isAdmin: false,
            loading: false
        };
        const state = reducer(initialState, clearUser());
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
    });

    it('should handle setLoading', () => {
        const state = reducer(undefined, setLoading(false));
        expect(state.loading).toBe(false);
    });
});
