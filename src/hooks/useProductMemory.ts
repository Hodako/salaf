"use client";

/**
 * Hook to manage temporary client-side product caching.
 * Stores product metadata in localStorage for a short duration
 * to make the site feel "alive" and navigation feel instant.
 */
export const useProductMemory = () => {
    const CACHE_KEY = "salaf_product_cache";
    const TTL = 10 * 60 * 1000; // 10 minutes

    const saveToMemory = (product: any) => {
        if (typeof window === "undefined" || !product) return;

        try {
            const currentCache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
            currentCache[product.slug] = {
                data: product,
                timestamp: Date.now()
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(currentCache));
        } catch (e) {
            console.warn("Failed to save product to memory", e);
        }
    };

    const getFromMemory = (slug: string) => {
        if (typeof window === "undefined") return null;

        try {
            const currentCache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
            const entry = currentCache[slug];

            if (entry && (Date.now() - entry.timestamp < TTL)) {
                return entry.data;
            }
            return null;
        } catch (e) {
            return null;
        }
    };

    const prefetchImage = (url: string) => {
        if (typeof window === "undefined" || !url) return;
        const img = new Image();
        img.src = url;
    };

    return { saveToMemory, getFromMemory, prefetchImage };
};
