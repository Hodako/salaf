"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { setCart } from "./slices/cartSlice";
import { setUser, setLoading } from "./slices/authSlice";
import { setWishlistItems, setWishlistProducts, setIsWishlistLoading } from "./slices/wishlistSlice";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import api from "@/lib/axios";

// Client-side initialization for Redux
function ReduxInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const cartItems = useAppSelector(state => state.cart.items);
    
    const wishlistIds = useAppSelector(state => state.wishlist.items);
    const isWishlistOpen = useAppSelector(state => state.wishlist.isWishlistOpen);
    const wishlistProducts = useAppSelector(state => state.wishlist.products);

    // 1. Hydrate Cart from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem("salaf_cart");
        if (saved) {
            try {
                dispatch(setCart(JSON.parse(saved)));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, [dispatch]);

    // 2. Persist Cart to LocalStorage dynamically
    useEffect(() => {
        if (cartItems.length > 0) {
            localStorage.setItem("salaf_cart", JSON.stringify(cartItems));
        } else {
            localStorage.removeItem("salaf_cart");
        }
    }, [cartItems]);

    // 3. Auth Listener & Sync
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
                dispatch(setLoading(true));
                try {
                    const { data } = await api.post("/auth/sync", {
                        firebaseUid: fbUser.uid,
                        email: fbUser.email,
                        name: fbUser.displayName,
                        image: fbUser.photoURL
                    });

                    const { data: profile } = await api.get("/auth/me");

                    const userPayload = {
                        uid: fbUser.uid,
                        email: fbUser.email,
                        name: fbUser.displayName || profile.name,
                        image: profile.image || fbUser.photoURL,
                        role: profile.role || data.role,
                        phoneNumber: profile.phoneNumber,
                        address: profile.address,
                        wishlist: profile.wishlist
                    };

                    dispatch(setUser(userPayload));

                    if (userPayload.wishlist) {
                        const dbIds = (userPayload.wishlist as any[]).map(p => p._id?.toString() || p.toString());
                        dispatch(setWishlistItems(dbIds));
                    }
                } catch (error) {
                    dispatch(setUser({
                        uid: fbUser.uid,
                        email: fbUser.email,
                        name: fbUser.displayName,
                        image: fbUser.photoURL,
                        role: "customer",
                    }));
                }
            } else {
                dispatch(setUser(null));
                dispatch(setWishlistItems([]));
            }
            dispatch(setLoading(false));
        });

        return () => unsubscribe();
    }, [dispatch]);

    // 4. Wishlist Product Fetching
    useEffect(() => {
        const fetchWishlistProducts = async () => {
            if (wishlistIds.length === 0) {
                dispatch(setWishlistProducts([]));
                return;
            }

            if (wishlistProducts.length === 0) {
                dispatch(setIsWishlistLoading(true));
            }

            try {
                const { data } = await api.get(`/products?ids=${wishlistIds.join(",")}&limit=50`);
                dispatch(setWishlistProducts(data.products || []));
            } catch (error) {
                console.error("Failed to fetch wishlist products");
            } finally {
                dispatch(setIsWishlistLoading(false));
            }
        };

        if (isWishlistOpen || wishlistIds.length > 0) {
            if (wishlistIds.length !== wishlistProducts.length || wishlistProducts.some((p: any) => !wishlistIds.includes(p._id.toString()))) {
                fetchWishlistProducts();
            }
        }
    }, [isWishlistOpen, wishlistIds, dispatch]); // Intentionally omitting wishlistProducts to avoid infinite loop

    return <>{children}</>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <ReduxInitializer>{children}</ReduxInitializer>
        </Provider>
    );
}
