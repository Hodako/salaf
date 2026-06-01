import { describe, it, expect } from 'vitest';
import reducer, { 
    setWishlistItems, setWishlistProducts, toggleWishlistItem, 
    setIsWishlistOpen, toggleWishlistSidebar, setIsWishlistLoading 
} from '../wishlistSlice';

describe('wishlistSlice', () => {
    it('should return initial state', () => {
        expect(reducer(undefined, { type: 'unknown' })).toEqual({
            items: [],
            products: [],
            isWishlistOpen: false,
            isLoading: false,
        });
    });

    it('should set wishlist items', () => {
        const state = reducer(undefined, setWishlistItems(['1', '2']));
        expect(state.items).toEqual(['1', '2']);
    });

    it('should set wishlist products', () => {
        const products = [{ _id: '1', name: 'Product 1' }];
        const state = reducer(undefined, setWishlistProducts(products));
        expect(state.products).toEqual(products);
    });

    it('should toggle wishlist item', () => {
        let state = reducer(undefined, toggleWishlistItem('1'));
        expect(state.items).toContain('1');
        
        // Setup state with product for testing un-toggle
        const stateWithProduct = {
            ...state,
            products: [{ _id: '1', name: 'Product 1' }]
        };
        
        state = reducer(stateWithProduct as any, toggleWishlistItem('1')); // toggle off
        expect(state.items).not.toContain('1');
        expect(state.products).toHaveLength(0);
    });

    it('should handle sidebar UI states', () => {
        let state = reducer(undefined, setIsWishlistOpen(true));
        expect(state.isWishlistOpen).toBe(true);
        
        state = reducer(state, toggleWishlistSidebar());
        expect(state.isWishlistOpen).toBe(false);
    });

    it('should handle loading state', () => {
        const state = reducer(undefined, setIsWishlistLoading(true));
        expect(state.isLoading).toBe(true);
    });
});
