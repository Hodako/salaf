import { rootReducer } from '@/store/rootReducer';
import { store } from '@/store';

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export interface AuthState {
    user: UserState | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;
}

export interface UserState {
    uid: string;
    email: string | null;
    name: string | null;
    image: string | null;
    role: "customer" | "admin" | null;
    phoneNumber?: string;
    wishlist?: any[];
    address?: {
        division: string;
        district: string;
        upazila: string;
        postCode: string;
        streetAddress: string;
    };
}

export interface CartItem {
    productId: string;
    productName: string;
    featuredImage: string;
    variationIdx: number;
    volume: string;
    price: number;
    quantity: number;
    slug: string;
    sku?: string;
    variantType?: string;
}

export interface CartState {
    items: CartItem[];
    isCartOpen: boolean;
}

export interface WishlistState {
    items: string[];
    products: any[]; // Full product objects
    isWishlistOpen: boolean;
    isLoading: boolean;
}

export interface UIState {
    isSidebarOpen: boolean;
    activeModal: string | null;
}
