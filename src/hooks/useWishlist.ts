"use client";

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleWishlistItem, setIsWishlistOpen, toggleWishlistSidebar } from '@/store/slices/wishlistSlice';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

/**
 * Custom hook for managing the user's product wishlist.
 * 
 * Provides functions to toggle products, check wishlist status, 
 * and manage wishlist UI visibility. Requires authentication.
 * 
 * @returns An object containing wishlist items, management functions, and status checks.
 */
export const useWishlist = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
    
    const wishlist = useAppSelector(state => state.wishlist.items);
    const wishlistProducts = useAppSelector(state => state.wishlist.products);
    const isWishlistOpen = useAppSelector(state => state.wishlist.isWishlistOpen);
    const isLoading = useAppSelector(state => state.wishlist.isLoading);

    const toggleWishlist = async (productId: string) => {
        if (authLoading) return;
        const pId = productId?.toString();

        if (!isAuthenticated) {
            toast.info("Please sign in to wishlist products.");
            router.push(`/auth?returnUrl=${encodeURIComponent(window.location.href)}`);
            return;
        }
        if (isAdmin) {
            toast.error("Admins cannot wishlist products.");
            return;
        }

        const exists = wishlist.includes(pId);

        try {
            dispatch(toggleWishlistItem(pId));
            await api.post("/user/wishlist", { productId: pId });
            toast.success(exists ? "Removed from wishlist" : "Added to wishlist");
        } catch (error) {
            dispatch(toggleWishlistItem(pId));
            toast.error("Failed to update wishlist");
        }
    };


    return {
        wishlist,
        wishlistProducts,
        isWishlistOpen,
        isLoading,
        isInWishlist: (productId: string) => wishlist.includes(productId?.toString()),
        toggleWishlist,
        removeFromWishlist: toggleWishlist,
        setIsWishlistOpen: (open: boolean) => dispatch(setIsWishlistOpen(open)),
        toggleWishlistSidebar: () => dispatch(toggleWishlistSidebar()),
    };
};
