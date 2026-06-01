import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WishlistState } from '@/types/store.types';

const initialState: WishlistState = {
    items: [],
    products: [],
    isWishlistOpen: false,
    isLoading: false,
};

/**
 * Redux slice for managing the user's product wishlist.
 * 
 * Handles storing wishlist item IDs and full product details.
 * Includes reducers for toggling items and managing wishlist UI state.
 */
const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        setWishlistItems: (state, action: PayloadAction<string[]>) => {
            state.items = action.payload;
        },
        setWishlistProducts: (state, action: PayloadAction<any[]>) => {
            state.products = action.payload;
        },
        toggleWishlistItem: (state, action: PayloadAction<string>) => {
            const exists = state.items.includes(action.payload);
            if (exists) {
                state.items = state.items.filter(id => id !== action.payload);
                state.products = state.products.filter(p => p._id.toString() !== action.payload);
            } else {
                state.items.push(action.payload);
            }
        },
        setIsWishlistOpen: (state, action: PayloadAction<boolean>) => {
            state.isWishlistOpen = action.payload;
        },
        toggleWishlistSidebar: (state) => {
            state.isWishlistOpen = !state.isWishlistOpen;
        },
        setIsWishlistLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const { 
    setWishlistItems, 
    setWishlistProducts, 
    toggleWishlistItem, 
    setIsWishlistOpen, 
    toggleWishlistSidebar,
    setIsWishlistLoading
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
