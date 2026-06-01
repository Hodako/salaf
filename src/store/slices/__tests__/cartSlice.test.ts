import { describe, it, expect } from 'vitest';
import reducer, { addToCart, updateQuantity, removeFromCart, clearCart, toggleCart } from '../cartSlice';

describe('cartSlice', () => {
    const mockItem = {
        productId: '1',
        productName: 'Test Product',
        featuredImage: 'img.jpg',
        variationIdx: 0,
        volume: '50ml',
        price: 100,
        quantity: 1,
        slug: 'test-product',
    };

    it('should return the initial state', () => {
        expect(reducer(undefined, { type: 'unknown' })).toEqual({
            items: [],
            isCartOpen: false,
        });
    });

    it('should handle addToCart', () => {
        const state = reducer(undefined, addToCart(mockItem));
        expect(state.items).toHaveLength(1);
        expect(state.items[0].productName).toBe('Test Product');
        expect(state.isCartOpen).toBe(true);
    });

    it('should increment quantity if item already exists', () => {
        let state = reducer(undefined, addToCart(mockItem));
        state = reducer(state, addToCart(mockItem));
        expect(state.items).toHaveLength(1);
        expect(state.items[0].quantity).toBe(2);
    });

    it('should handle removeFromCart', () => {
        let state = reducer(undefined, addToCart(mockItem));
        state = reducer(state, removeFromCart({ productId: '1', variationIdx: 0 }));
        expect(state.items).toHaveLength(0);
    });

    it('should handle updateQuantity', () => {
        let state = reducer(undefined, addToCart(mockItem));
        state = reducer(state, updateQuantity({ productId: '1', variationIdx: 0, delta: 2 }));
        expect(state.items[0].quantity).toBe(3);
        
        // Should not drop below 1
        state = reducer(state, updateQuantity({ productId: '1', variationIdx: 0, delta: -10 }));
        expect(state.items[0].quantity).toBe(1);
    });

    it('should handle clearCart', () => {
        let state = reducer(undefined, addToCart(mockItem));
        state = reducer(state, clearCart());
        expect(state.items).toHaveLength(0);
    });

    it('should toggle cart open state', () => {
        let state = reducer(undefined, toggleCart());
        expect(state.isCartOpen).toBe(true);
        state = reducer(state, toggleCart());
        expect(state.isCartOpen).toBe(false);
    });
});
