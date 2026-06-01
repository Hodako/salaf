/**
 * @file productApi.ts
 * @description Enterprise RTK Query implementation for Product operations.
 * Handles data fetching, sophisticated caching, and loading states for the Storefront.
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IProductDocument } from '@/types/models.types';

// Omit the Mongoose-specific functions and enforce _id as a serialized string for the UI layer
import { ClientProduct, ShopFilters } from '@/types';

/**
 * RTK Query API service for product-related operations.
 * 
 * Provides endpoints for fetching products with various filters 
 * and retrieving individual product details.
 */
export const productApi = createApi({
 reducerPath: 'productApi',
 baseQuery: fetchBaseQuery({ baseUrl: process.env.NODE_ENV === 'test' ? 'http://localhost/api/' : '/api/' }),
 tagTypes: ['Product'],
 endpoints: (builder) => ({
 /**
 * @method getProducts
 * @description Fetches the paginated list of products based on comprehensive Shop Filters.
 * @returns Array of serialized ClientProducts and pagination metadata.
 */
 getProducts: builder.query<{ products: ClientProduct[]; total: number; page: number; totalPages: number }, ShopFilters>({
 query: (filters) => {
 const params = new URLSearchParams();
 if (filters.query) params.append('query', filters.query);
 if (filters.category) {
     if (Array.isArray(filters.category)) {
         if (filters.category.length) params.append('category', filters.category.join(','));
     } else {
         params.append('category', filters.category);
     }
 }
 if (filters.subcategory) params.append('subcategory', filters.subcategory);
 if (filters.collection) params.append('collection', filters.collection);
 if (filters.brand) params.append('brand', filters.brand);
 if (filters.tags?.length) params.append('tags', filters.tags.join(','));
 if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
 if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
 if (filters.page) params.append('page', filters.page.toString());
 if (filters.limit) params.append('limit', filters.limit.toString());
 if (filters.sort) params.append('sort', filters.sort);

 return `products?${params.toString()}`;
 },
 providesTags: (result) =>
 result
 ? [
 ...result.products.map(({ _id }) => ({ type: 'Product' as const, id: _id })),
 { type: 'Product', id: 'LIST' },
 ]
 : [{ type: 'Product', id: 'LIST' }],
 }),

 /**
 * @method getProductBySlug
 * @description Fetches a singular detailed product payload for the Product View modal/page.
 */
 getProductBySlug: builder.query<ClientProduct, string>({
 query: (slug) => `products/${slug}`,
 providesTags: (result, error, slug) => [{ type: 'Product', id: slug }],
 }),
 }),
});

// Auto-generated React Hooks for use in components
export const {
 useGetProductsQuery,
 useGetProductBySlugQuery,
 usePrefetch
} = productApi;
