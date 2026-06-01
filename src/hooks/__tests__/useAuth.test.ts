import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

vi.mock('@/store/hooks');
vi.mock('@/store/slices/authSlice');
vi.mock('firebase/auth');
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

describe('useAuth hook', () => {
    const mockDispatch = vi.fn();
    const mockPush = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppDispatch as any).mockReturnValue(mockDispatch);
        (useRouter as any).mockReturnValue({ push: mockPush });
    });

    it('should return auth state from store', () => {
        const mockUser = { uid: '123', email: 'test@example.com' };
        (useAppSelector as any).mockImplementation((selector: any) => selector({
            auth: {
                user: mockUser,
                isAuthenticated: true,
                isAdmin: false,
                loading: false,
            }
        }));

        const { result } = renderHook(() => useAuth());

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isAdmin).toBe(false);
        expect(result.current.loading).toBe(false);
    });

    it('should call signOut, clearUser and redirect on signOut', async () => {
        (useAppSelector as any).mockImplementation((selector: any) => selector({
            auth: {
                user: { uid: '123' },
                isAuthenticated: true,
                isAdmin: false,
                loading: false,
            }
        }));

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.signOut();
        });

        expect(firebaseSignOut).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledWith(clearUser());
        expect(mockPush).toHaveBeenCalledWith('/');
    });
});
