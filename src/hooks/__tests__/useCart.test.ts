import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from '../useCart';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addToCart, removeFromCart, updateQuantity, clearCart, setIsCartOpen, toggleCart } from '@/store/slices/cartSlice';
import { toast } from 'sonner';
import { logAddToCart } from '@/lib/gtm';

vi.mock('@/store/hooks');
vi.mock('@/store/slices/cartSlice');
vi.mock('sonner');
vi.mock('@/lib/gtm');

describe('useCart hook', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppDispatch as any).mockReturnValue(mockDispatch);
    });

    it('should return cart state from store', () => {
        const mockItems = [{ productId: '123', productName: 'Test', featuredImage: 'test.jpg', variationIdx: 0 }];
        (useAppSelector as any).mockImplementation((selector: any) => {
            if (typeof selector === 'function') {
                return selector({ cart: { items: mockItems, isCartOpen: false } });
            }
            return mockItems; // Default for state.cart.items
        });

        // Mock specific selectors if needed
        (useAppSelector as any).mockImplementation((selector: any) => {
             const state = { 
                cart: { 
                    items: mockItems, 
                    isCartOpen: true 
                } 
            };
            if (selector.name === 'selectCartTotalItems') return 1;
            if (selector.name === 'selectCartTotalPrice') return 100;
            if (typeof selector === 'function') return selector(state);
            return state.cart.items;
        });

        const { result } = renderHook(() => useCart());

        expect(result.current.cart).toEqual(mockItems);
        expect(result.current.isCartOpen).toBe(true);
    });

    it('should dispatch addToCart and toast on addToCart', () => {
        const mockItem = { productId: '123', productName: 'Test', price: 100, quantity: 1, volume: '500ml', slug: 'test', featuredImage: 'test.jpg', variationIdx: 0 };
        const { result } = renderHook(() => useCart());

        act(() => {
            result.current.addToCart(mockItem as any);
        });

        expect(mockDispatch).toHaveBeenCalledWith(addToCart(mockItem));
        expect(toast.success).toHaveBeenCalled();
        expect(logAddToCart).toHaveBeenCalled();
    });

    it('should dispatch removeFromCart on removeFromCart', () => {
        const { result } = renderHook(() => useCart());

        act(() => {
            result.current.removeFromCart('123', 0);
        });

        expect(mockDispatch).toHaveBeenCalledWith(removeFromCart({ productId: '123', variationIdx: 0 }));
        expect(toast.info).toHaveBeenCalled();
    });

    it('should dispatch updateQuantity on updateQuantity', () => {
        const { result } = renderHook(() => useCart());

        act(() => {
            result.current.updateQuantity('123', 0, 1);
        });

        expect(mockDispatch).toHaveBeenCalledWith(updateQuantity({ productId: '123', variationIdx: 0, delta: 1 }));
    });

    it('should dispatch clearCart on clearCart', () => {
        const { result } = renderHook(() => useCart());

        act(() => {
            result.current.clearCart();
        });

        expect(mockDispatch).toHaveBeenCalledWith(clearCart());
    });

    it('should dispatch setIsCartOpen on setIsCartOpen', () => {
        const { result } = renderHook(() => useCart());

        act(() => {
            result.current.setIsCartOpen(true);
        });

        expect(mockDispatch).toHaveBeenCalledWith(setIsCartOpen(true));
    });

    it('should dispatch toggleCart on toggleCart', () => {
        const { result } = renderHook(() => useCart());

        act(() => {
            result.current.toggleCart();
        });

        expect(mockDispatch).toHaveBeenCalledWith(toggleCart());
    });
});
