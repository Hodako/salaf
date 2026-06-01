import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { productApi } from '../productApi';
import { ClientProduct } from '@/types';

const mockProduct: ClientProduct = {
    _id: "123",
    name: "Oud Wood",
    slug: "oud-wood",
    skuPrefix: "OUD",
    featuredImage: "img.jpg",
    images: ["img.jpg"],
    tags: [],
    collections: [],
    variations: [{ volume: '50', volumeUnit: 'ml', basePrice: 5000 }],
    detailsSections: []
} as any;

describe('productApi', () => {
    let store: any;

    beforeEach(() => {
        store = configureStore({
            reducer: { [productApi.reducerPath]: productApi.reducer },
            middleware: (gDM) => gDM({ serializableCheck: false }).concat(productApi.middleware),
        });
        global.fetch = vi.fn() as any;
    });

    it('successfully fetches paginated products with precise query parameters', async () => {
        (global.fetch as any).mockResolvedValueOnce(
            new Response(JSON.stringify({ products: [mockProduct], total: 1, page: 2, totalPages: 5 }), {
                status: 200,
                headers: new Headers({ 'Content-Type': 'application/json' }),
            })
        );
        const result = await store.dispatch(productApi.endpoints.getProducts.initiate({ page: 2, sort: 'price-asc', query: 'Oud' }));
        expect(result.data).toBeDefined();
        if (result.data) {
            expect(result.data.products[0].name).toBe('Oud Wood');
            expect(result.data.page).toBe(2);
        }
        const fetchCall = (global.fetch as any).mock.calls[0][0] as Request;
        expect(fetchCall.url).toContain('/api/products?query=Oud&page=2&sort=price-asc');
    });

    it('successfully fetches a heavily nested product by slug', async () => {
        (global.fetch as any).mockResolvedValueOnce(
            new Response(JSON.stringify(mockProduct), {
                status: 200,
                headers: new Headers({ 'Content-Type': 'application/json' }),
            })
        );
        const result = await store.dispatch(productApi.endpoints.getProductBySlug.initiate('oud-wood'));
        expect(result.data).toBeDefined();
        if (result.data) {
            expect(result.data.name).toBe('Oud Wood');
            expect(result.data.variations[0].basePrice).toBe(5000);
        }
        const fetchCall = (global.fetch as any).mock.calls[0][0] as Request;
        expect(fetchCall.url).toContain('/api/products/oud-wood');
    });
});
