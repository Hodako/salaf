"use client";

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';
import { auth } from '@/lib/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for managing user authentication state and session synchronization.
 * 
 * Provides access to the current Firebase user, loading state, and a method 
 * to sign out and clear the session.
 * 
 * @returns An object containing the current user, loading status, authentication status, and sign-out function.
 */
export function useAuth() {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated, isAdmin, loading } = useAppSelector(state => state.auth);
    const router = useRouter();

    const signOut = async () => {
        await firebaseSignOut(auth);
        dispatch(clearUser());
        router.push('/');
    };

    return { user, loading, isAuthenticated, isAdmin, signOut };
}
