import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState } from '@/types/store.types';

interface AuthState {
    user: UserState | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: true,
};

/**
 * Redux slice for managing authentication state.
 * 
 * Handles storing the current user, authentication status, admin privileges, 
 * and loading states.
 */
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserState | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            state.isAdmin = action.payload?.role === 'admin';
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isAdmin = false;
        },
    },
});

export const { setUser, setLoading, clearUser } = authSlice.actions;
export default authSlice.reducer;
