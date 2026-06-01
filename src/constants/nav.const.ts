import { NavAction } from '@/types';
import { Search, ShoppingCart, User, Heart } from 'lucide-react';
export const navLinks = [
    {
        title: "Home",
        href: "/",
    },
    {
        title: "Shop",
        href: "/shop",
    },
    {
        title: "About us",
        href: "/about-us",
    },
    {
        title: "Contact us",
        href: "/contact-us",
    },
];

export const navActions: NavAction[] = [
    {
        id: 1,
        icon: Search,
        label: "Search products",
    },
    {
        id: 2,
        icon: ShoppingCart,
        label: "Shopping cart",
    },
    {
        id: 4,
        icon: Heart,
        label: "Wishlist",
    },
    {
        id: 3,
        icon: User,
        label: "User account",
        href: "/auth",
    },
]