"use client";

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart, removeFromCart, updateQuantity, clearCart, setIsCartOpen, toggleCart, selectCartTotalItems, selectCartTotalPrice } from '@/store/slices/cartSlice';
import { CartItem } from '@/types/store.types';
import { toast } from 'sonner';
import { logAddToCart } from '@/lib/gtm';

/**
 * Custom hook for managing the shopping cart state.
 * 
 * Integrates with Redux to provide cart operations like adding/removing items,
 * adjusting quantities, and calculating totals. Also handles cart UI visibility.
 * 
 * @returns An object containing cart items, totals, and cart management functions.
 */
export const useCart = () => {
    const dispatch = useAppDispatch();
    const cart = useAppSelector(state => state.cart.items);
    const isCartOpen = useAppSelector(state => state.cart.isCartOpen);
    const totalItems = useAppSelector(selectCartTotalItems);
    const totalPrice = useAppSelector(selectCartTotalPrice);

    return {
        cart,
        isCartOpen,
        totalItems,
        totalPrice,
        addToCart: (item: CartItem) => {
            dispatch(addToCart(item));
            toast.success(`${item.productName} added to bag!`);
            logAddToCart(
                { _id: item.productId, name: item.productName, slug: item.slug },
                { volume: item.volume, salePrice: item.price },
                item.quantity
            );
        },
        removeFromCart: (productId: string, variationIdx: number) => {
            dispatch(removeFromCart({ productId, variationIdx }));
            toast.info("Item removed from bag");
        },
        updateQuantity: (productId: string, variationIdx: number, delta: number) => {
            dispatch(updateQuantity({ productId, variationIdx, delta }));
        },
        clearCart: () => {
            dispatch(clearCart());
        },
        setIsCartOpen: (open: boolean) => dispatch(setIsCartOpen(open)),
        toggleCart: () => dispatch(toggleCart())
    };
};
