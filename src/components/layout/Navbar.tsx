"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ShoppingBag, ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, X, Loader2, ArrowLeft, History, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { NoticeMarquee } from "./NoticeMarquee";
import { AnimatePresence, motion } from "framer-motion";

const TRENDING_KEYWORDS = ["Oud", "Musk", "Attar", "Mukhallat", "Floral", "Victorious"];

/**
 * The primary navigation bar component.
 *
 * Desktop: Luxury dark centered logo layout.
 * Mobile: Amazon & YouTube inspired — full-width expanding search bar hiding logo/cart,
 *         suggestions list, trending chips, and recent search keywords stored in local storage.
 */
const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isAdmin } = useAuth();
    const { toggleCart, totalItems } = useCart();
    const { toggleWishlistSidebar, wishlist } = useWishlist();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);

    const searchRef = useRef<HTMLDivElement>(null);
    const mobileSearchRef = useRef<HTMLInputElement>(null);
    const lastScrollY = useRef(0);

    // Click outside to collapse search
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest("[data-mobile-search-toggle]")) return;
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle suggestions search debounce fetch
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsLoading(true);
                try {
                    const response = await axios.get(`/api/products?q=${searchQuery}&limit=4`);
                    setSearchResults(response.data.products || []);
                } catch (error) {
                    console.error("Search error:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 200);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Auto-collapse search overlay on page changes
    useEffect(() => {
        setIsSearchOpen(false);
        setSearchQuery("");
    }, [pathname]);

    // Lock body scrolling when mobile search is active (YouTube app-like experience)
    useEffect(() => {
        if (isSearchOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isSearchOpen]);

    // Scroll visible toggles
    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;
            if (currentY < 0) return; // ios bounce skip
            setIsScrolled(currentY > 20);

            if (isSearchOpen || currentY < 40) {
                setIsHeaderVisible(true);
            } else if (currentY > lastScrollY.current) {
                setIsHeaderVisible(false);
            } else {
                setIsHeaderVisible(true);
            }
            lastScrollY.current = currentY;
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isSearchOpen]);

    const handleSearchSubmit = (term: string) => {
        const trimmed = term.trim();
        if (trimmed) {
            setIsSearchOpen(false);
            setSearchQuery("");
            router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        }
    };

    const userHref = !isAuthenticated ? "/auth" : (isAdmin ? "/admin/dashboard" : "/dashboard");

    return (
        <header className={cn(
            "w-full sticky top-0 z-50 flex flex-col text-gray-950 transition-all duration-300 ease-in-out will-change-transform gold-gradient gold-bevel",
            isHeaderVisible ? "translate-y-0" : "-translate-y-full",
            isScrolled
                ? "shadow-[0_8px_30px_rgba(172,135,23,0.45)]"
                : "shadow-[0_4px_20px_rgba(172,135,23,0.35)]"
        )}>
            {!isSearchOpen && <NoticeMarquee isScrolled={isScrolled} />}

            {/* ═══════════════════════════════════════════
                DESKTOP NAV — Luxury layout
            ═══════════════════════════════════════════ */}
            <nav
                className={cn(
                    "hidden md:flex items-center justify-between mx-auto px-6 md:px-12 lg:px-20 xl:px-28 w-full max-w-[2560px] transition-all duration-300",
                    isScrolled ? "py-1.5 md:py-2.5" : "py-2 md:py-4"
                )}
                aria-label="Main Navigation"
            >
                {/* Desktop Left Links */}
                <div className="hidden md:flex flex-1 items-center justify-start gap-12 font-bold text-sm tracking-[0.25em] uppercase">
                    <Link href={userHref} className="text-gray-950 hover:text-white transition-colors duration-300">ACCOUNT</Link>
                    <Link href="/contact-us" className="text-gray-950 hover:text-white transition-colors duration-300">FIND US</Link>
                    <Link href="/shop" className="text-gray-950 hover:text-white transition-colors duration-300">SHOP</Link>
                    <Link href="/blog" className="text-gray-950 hover:text-white transition-colors duration-300">BLOG</Link>
                </div>

                {/* Center Logo */}
                <div className="flex items-center justify-center flex-shrink-0 mx-4">
                    <Link href="/" className="flex items-center gap-4 group" aria-label="Salaf - Home" title="Salaf Home">
                        <div className="relative w-10 h-10 md:w-13 md:h-13 transition-transform group-hover:scale-105 duration-300">
                            <Image src="/nav-logo.png" alt="Salaf Logo" fill className="object-contain filter brightness-150 mix-blend-screen" priority />
                        </div>
                        <h1 className="text-3xl md:text-[40px] tracking-[0.25em] uppercase font-heading font-black text-gray-950 group-hover:opacity-80 transition-all duration-300 select-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">
                            SALAF
                        </h1>
                    </Link>
                </div>

                {/* Desktop Right Actions — Always Visible Search Icon */}
                <div className="hidden md:flex flex-1 items-center justify-end gap-7">
                    <button onClick={() => setIsSearchOpen(!isSearchOpen)} aria-label="Search products" className="text-gray-950 hover:text-white transition-colors duration-300 cursor-pointer p-1.5">
                        <SearchIcon className="w-6 h-6" />
                    </button>
                    <button onClick={toggleCart} aria-label="Shopping cart" className="text-gray-950 hover:text-white transition-colors duration-300 cursor-pointer relative p-1.5">
                        <ShoppingBag className="w-6 h-6" />
                        {totalItems > 0 && (
                            <span className="absolute top-0.5 right-0.5 bg-gray-950 text-[10px] text-white font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md select-none">
                                {totalItems}
                            </span>
                        )}
                    </button>
                    <button onClick={toggleWishlistSidebar} aria-label="Wishlist" className="text-gray-950 hover:text-white transition-colors duration-300 cursor-pointer relative p-1.5">
                        <Heart className="w-6 h-6" />
                    </button>
                    <Link href="/contact-us" className="px-6 py-2.5 rounded-full border border-gray-950/80 text-gray-950 font-bold text-[11px] tracking-[0.2em] hover:bg-gray-950 hover:text-white transition-all uppercase whitespace-nowrap ml-3 text-center shadow-md bg-white/20 backdrop-blur-xs">
                        Store Location
                    </Link>
                </div>

                {/* Desktop Search Overlay */}
                {isSearchOpen && (
                    <div className="absolute top-full left-0 w-full gold-gradient gold-bevel text-gray-950 animate-in fade-in slide-in-from-top-2 duration-300 shadow-[0_12px_40px_rgba(172,135,23,0.5)] z-[100]">
                        <div className="container mx-auto px-6 h-20 flex items-center gap-4" ref={searchRef}>
                            <div className="relative flex-1 group flex items-center">
                                <SearchIcon className="absolute left-2 w-5 h-5 text-gray-950/60 group-focus-within:text-white transition-colors" />
                                <Input
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && searchQuery.trim()) {
                                            handleSearchSubmit(searchQuery.trim());
                                        }
                                    }}
                                    placeholder="Search luxury perfumes..."
                                    className="pl-10 h-12 bg-transparent border-none text-gray-950 placeholder:text-gray-950/40 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none w-full"
                                />
                                {isLoading && <Loader2 className="absolute right-2 w-5 h-5 animate-spin text-gray-950" />}
                            </div>
                            <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-black/10 rounded-full text-gray-950/80 hover:text-black transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {searchResults.length > 0 && (
                            <div className="container mx-auto px-6 pb-6">
                                <div className="flex flex-col gap-1 border-t border-black/10 pt-4 max-w-xl">
                                    {searchResults.map((product) => (
                                        <button
                                            key={product._id}
                                            onClick={() => handleSearchSubmit(product.name)}
                                            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/20 text-gray-950 hover:text-white font-medium text-sm text-left w-full cursor-pointer transition-colors"
                                        >
                                            <SearchIcon className="w-4 h-4 text-gray-950/60 shrink-0" />
                                            <span>{product.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {searchQuery.length >= 2 && !isLoading && searchResults.length === 0 && (
                            <div className="container mx-auto px-6 pb-8 text-center text-white/40 text-sm">
                                No products found for "{searchQuery}"
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* ═══════════════════════════════════════════
                MOBILE NAV — YouTube Mobile Style
            ═══════════════════════════════════════════ */}
            <div className="md:hidden flex flex-col w-full relative" ref={searchRef}>
                {isSearchOpen ? (
                    /* Mobile Expanded Search Topbar (Covers/hides other header elements) */
                    <div className="flex items-center gap-2 px-3 py-2 w-full bg-white h-14 border-b border-gray-200 z-50">
                        {/* Back Arrow to Collapse */}
                        <button
                            onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-700 active:scale-95 transition-all shrink-0 cursor-pointer"
                            aria-label="Back"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>

                        {/* Input Area */}
                        <div className="relative flex-1 flex items-center bg-gray-100 h-10 rounded-full px-3.5">
                            <input
                                ref={mobileSearchRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && searchQuery.trim()) {
                                        handleSearchSubmit(searchQuery.trim());
                                    }
                                }}
                                placeholder="Search Salaf fragrances..."
                                className="w-full h-full bg-transparent text-gray-900 text-sm outline-none border-none placeholder:text-gray-400 font-sans"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="p-1 hover:bg-gray-200 rounded-full text-gray-500 mr-1 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={() => {
                                if (searchQuery.trim()) {
                                    handleSearchSubmit(searchQuery.trim());
                                }
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-700 active:scale-95 transition-all shrink-0 cursor-pointer"
                        >
                            <SearchIcon className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    /* Standard Header Row */
                    <div className="flex items-center justify-between px-3 py-1.5 w-full">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2" aria-label="Salaf - Home">
                            <div className="relative w-6 h-6">
                                <Image src="/nav-logo.png" alt="Salaf" fill className="object-contain brightness-150 mix-blend-screen" priority />
                            </div>
                            <span className="text-gray-950 font-heading font-black tracking-[0.22em] uppercase text-base leading-none select-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">
                                SALAF
                            </span>
                        </Link>

                        {/* Right Icons — Search Button Always Available */}
                        <div className="flex items-center gap-1.5">
                            <button
                                data-mobile-search-toggle
                                onClick={() => {
                                    setIsSearchOpen(true);
                                    window.setTimeout(() => mobileSearchRef.current?.focus(), 80);
                                }}
                                className="relative flex items-center justify-center w-8 h-8 text-gray-950 hover:text-white active:scale-95 transition-all cursor-pointer"
                                aria-label="Search products"
                                aria-expanded={isSearchOpen}
                            >
                                <SearchIcon className="w-4.5 h-4.5" strokeWidth={2} />
                            </button>

                            {/* Cart Icon */}
                            <button
                                onClick={toggleCart}
                                className="relative flex items-center justify-center w-8 h-8 text-gray-950 hover:text-white active:scale-95 transition-all cursor-pointer"
                                aria-label="Shopping cart"
                            >
                                <ShoppingCart className="w-4.5 h-4.5" strokeWidth={1.8} />
                                {totalItems > 0 && (
                                    <span className="absolute top-0.5 right-0.5 bg-gray-950 text-white text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center leading-none rounded-full shadow-xs">
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile Fullscreen Suggestions & Keywords Overlay */}
                {isSearchOpen && (
                    <div className="fixed inset-x-0 bottom-0 top-[56px] bg-white z-[200] flex flex-col overflow-y-auto px-4 py-6 gap-6 animate-in fade-in duration-200 border-t border-gray-100 shadow-2xl">
                        
                        {/* ── Trending Searches ── */}
                        {searchQuery.trim() === "" && (
                            <div className="flex flex-col gap-3">
                                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Trending Searches</span>
                                <div className="flex flex-wrap gap-2">
                                    {TRENDING_KEYWORDS.map((kw, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSearchSubmit(kw)}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-[#d4af37]/10 active:bg-[#d4af37]/20 border border-gray-100 rounded-full text-xs font-semibold text-gray-700 tracking-wider transition-all cursor-pointer"
                                        >
                                            <TrendingUp className="w-3.5 h-3.5 text-bprimary-dark shrink-0" />
                                            <span>{kw}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Suggestions / Realtime Autocomplete matching ── */}
                        {searchQuery.trim() !== "" && (
                            <div className="flex flex-col gap-2">
                                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Suggestions</span>
                                <div className="flex flex-col">
                                    {/* Clickable raw query term search suggestion */}
                                    <button
                                        onClick={() => handleSearchSubmit(searchQuery.trim())}
                                        className="flex items-center gap-3 border-b border-gray-50 py-3 text-sm text-bprimary-dark hover:text-bprimary font-sans font-semibold text-left cursor-pointer"
                                    >
                                        <SearchIcon className="w-4 h-4 shrink-0 text-bprimary-dark" />
                                        <span>Search for "{searchQuery}"</span>
                                    </button>

                                    {/* Dynamic matching keyword suggestions (YouTube style) */}
                                    {searchResults.map((product) => (
                                        <button
                                            key={product._id}
                                            onClick={() => handleSearchSubmit(product.name)}
                                            className="flex items-center gap-3 border-b border-gray-50 py-3 text-sm text-gray-800 hover:text-bprimary-dark hover:bg-gray-50/50 text-left w-full font-sans font-medium cursor-pointer"
                                        >
                                            <SearchIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span>{product.name}</span>
                                        </button>
                                    ))}

                                    {searchQuery.length >= 2 && !isLoading && searchResults.length === 0 && (
                                        <div className="py-6 text-center text-gray-400 text-sm">
                                            No matched fragrance suggestions found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
