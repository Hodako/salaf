import { ShopFilters } from '@/types';
import { useGetProductsQuery } from '@/store/api/productApi';

/**
 * Custom hook for fetching and filtering products for the main shop page.
 * 
 * Handles search queries, tag filtering, and collection-based filtering.
 * 
 * @param filters - The shop filters (collection, sort, page, query).
 * @returns An object containing filtered products and loading state.
 */
export const useShopProducts = (filters: ShopFilters) => {
    return useGetProductsQuery({
        category: filters.category,
        subcategory: filters.subcategory,
        collection: filters.collection,
        brand: filters.brand,
        sort: filters.sort,
        page: filters.page,
        query: filters.query,
    });
};
