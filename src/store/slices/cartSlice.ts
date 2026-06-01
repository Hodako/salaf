import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartState, CartItem } from '@/types/store.types';

const initialState: CartState = {
    items: [],
    isCartOpen: false,
};

/**
 * Redux slice for managing the shopping cart state.
 * 
 * Includes reducers for adding/removing items, updating quantities, 
 * and toggling cart visibility. Also provides selectors for calculating 
 * totals and item counts.
 */
const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCart: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
        },
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const item = action.payload;
            const existing = state.items.find(
                (i) => i.productId === item.productId && i.variationIdx === item.variationIdx
            );

            if (existing) {
                existing.quantity += item.quantity;
            } else {
                state.items.push(item);
            }
            state.isCartOpen = true;
        },
        removeFromCart: (state, action: PayloadAction<{ productId: string; variationIdx: number }>) => {
            state.items = state.items.filter(
                (i) => !(i.productId === action.payload.productId && i.variationIdx === action.payload.variationIdx)
            );
        },
        updateQuantity: (state, action: PayloadAction<{ productId: string; variationIdx: number; delta: number }>) => {
            const item = state.items.find(
                (i) => i.productId === action.payload.productId && i.variationIdx === action.payload.variationIdx
            );
            if (item) {
                item.quantity = Math.max(1, item.quantity + action.payload.delta);
            }
        },
        clearCart: (state) => {
            state.items = [];
        },
        setIsCartOpen: (state, action: PayloadAction<boolean>) => {
            state.isCartOpen = action.payload;
        },
        toggleCart: (state) => {
            state.isCartOpen = !state.isCartOpen;
        },
    },
});

export const { setCart, addToCart, removeFromCart, updateQuantity, clearCart, setIsCartOpen, toggleCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotalItems = (state: { cart: CartState }) => 
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartTotalPrice = (state: { cart: CartState }) => 
    state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export default cartSlice.reducer;
