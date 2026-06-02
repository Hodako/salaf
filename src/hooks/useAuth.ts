"use client";

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for managing user authentication state and session synchronization.
 * 
 * Provides access to the current active user session, loading state, and a method 
 * to sign out and clear cookies.
 * 
 * @returns An object containing the current user, loading status, authentication status, and sign-out function.
 */
export function useAuth() {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated, isAdmin, loading } = useAppSelector(state => state.auth);
    const router = useRouter();

    const signOut = async () => {
        try {
            await api.post('/auth/signout');
        } catch (e) {}
        dispatch(clearUser());
        router.push('/');
    };

    return { user, loading, isAuthenticated, isAdmin, signOut };
}
