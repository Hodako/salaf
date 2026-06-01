"use client";
 
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon, Loader2, X, ChevronDown } from "lucide-react";
import { useShopProducts } from "@/hooks/useShopProducts";
import { ProductCard } from "@/components/home/ProductCard";
import { cn } from "@/lib/utils";
 
function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get("q") || "";
 
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [activeQuery, setActiveQuery] = useState(initialQuery);
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem("salaf_recent_searches");
                if (stored) {
                    setRecentSearches(JSON.parse(stored));
                }
            } catch (e) {
                console.error("Failed to load search history:", e);
            }
        }
    }, []);

    useEffect(() => {
        const query = activeQuery.trim();
        if (query) {
            setRecentSearches(prev => {
                const filtered = prev.filter(q => q.toLowerCase() !== query.toLowerCase());
                const next = [query, ...filtered].slice(0, 10);
                if (typeof window !== "undefined") {
                    try {
                        localStorage.setItem("salaf_recent_searches", JSON.stringify(next));
                    } catch (e) {}
                }
                return next;
            });
        }
    }, [activeQuery]);

    const clearRecentSearches = () => {
        setRecentSearches([]);
        if (typeof window !== "undefined") {
            try {
                localStorage.removeItem("salaf_recent_searches");
            } catch (e) {}
        }
    };

    const removeRecentSearch = (term: string) => {
        setRecentSearches(prev => {
            const next = prev.filter(q => q !== term);
            if (typeof window !== "undefined") {
                try {
                    localStorage.setItem("salaf_recent_searches", JSON.stringify(next));
                } catch (e) {}
            }
            return next;
        });
    };
 
    // Sync with URL parameter updates
    useEffect(() => {
        const q = searchParams.get("q") || "";
        setSearchQuery(q);
        setActiveQuery(q);
        setPage(1);
    }, [searchParams]);
 
    // Debounce active search query to prevent excessive queries while typing
    useEffect(() => {
        const handler = setTimeout(() => {
            setActiveQuery(searchQuery);
            setPage(1);
            // Optionally update URL query param silently
            const params = new URLSearchParams(window.location.search);
            if (searchQuery.trim()) {
                params.set("q", searchQuery.trim());
            } else {
                params.delete("q");
            }
            router.replace(`/search?${params.toString()}`, { scroll: false });
        }, 300);
 
        return () => clearTimeout(handler);
    }, [searchQuery, router]);
 
    const { data, isLoading } = useShopProducts({
        query: activeQuery,
        sort,
        page,
    } as any);
 
    const products = data?.products || [];
    const totalPages = data?.totalPages || 1;
 
    const sortOptions = [
        { label: "Newest", value: "newest" },
        { label: "Price: Low to High", value: "price_asc" },
        { label: "Price: High to Low", value: "price_desc" },
        { label: "Popularity", value: "popularity" },
    ];
 
    const currentSortLabel = sortOptions.find(o => o.value === sort)?.label || "Sort By";
 
    const handleClear = () => {
        setSearchQuery("");
        setActiveQuery("");
        router.replace("/search", { scroll: false });
    };
 
    return (
        <div className="min-h-screen bg-background pt-6 md:pt-32 pb-20 md:pb-24 px-3 sm:px-6">
            <div className="container mx-auto max-w-6xl space-y-8">
                {/* Search & Sort Controls bar */}
                <div className="flex items-center justify-between bg-muted/30 border border-border/40 p-3 md:p-4 rounded-2xl md:rounded-3xl mt-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                        {activeQuery ? `Fragrance Results: "${activeQuery}"` : "Premium Fragrance Search"}
                    </span>

                    {/* Sort Dropdown */}
                    <div className="relative shrink-0 flex items-center justify-end">
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center justify-between gap-3 px-5 h-11 bg-background/50 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-bprimary/40 transition-colors w-full sm:w-56 cursor-pointer"
                        >
                            <span>{currentSortLabel}</span>
                            <ChevronDown className={cn("w-4 h-4 transition-transform", isSortOpen && "rotate-180")} />
                        </button>

                        {isSortOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                                <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-2xl overflow-hidden z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                    {sortOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => {
                                                setSort(opt.value);
                                                setIsSortOpen(false);
                                                setPage(1);
                                            }}
                                            className={cn(
                                                "w-full text-left px-5 py-3.5 text-xs font-medium transition-colors hover:bg-muted cursor-pointer",
                                                sort === opt.value
                                                    ? "text-bprimary-dark bg-muted font-bold"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
 


                {/* Results metadata */}
                {activeQuery && !isLoading && (
                    <p className="text-xs sm:text-sm text-muted-foreground italic">
                        {products.length === 0 
                            ? `No results found for "${activeQuery}"`
                            : `Found ${products.length} product${products.length > 1 ? "s" : ""} matching "${activeQuery}"`
                        }
                    </p>
                )}
 
                {/* Product Grid / States */}
                {isLoading && products.length === 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-4 md:gap-6 pt-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="aspect-4/5 bg-muted/40 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-16 md:py-24 px-4 text-center rounded-3xl border border-dashed border-border/60 bg-muted/10 space-y-6">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                            <SearchIcon className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg md:text-xl font-heading font-medium text-foreground">
                                No fragrances found
                            </h3>
                            <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-4">
                                We couldn't find any products matching "{activeQuery || searchQuery}". Try refining your search query or looking for scent families like "Oud", "Musk", or "Floral".
                            </p>
                            {(data as any)?.didYouMean && (
                                <div className="mt-4 pt-4 border-t border-border/20 flex flex-col items-center justify-center gap-1.5 animate-in fade-in duration-300">
                                    <p className="text-xs sm:text-sm text-muted-foreground font-sans font-medium">
                                        Did you mean:{" "}
                                        <button
                                            onClick={() => {
                                                const sugg = (data as any).didYouMean;
                                                setSearchQuery(sugg);
                                                setActiveQuery(sugg);
                                                const params = new URLSearchParams(window.location.search);
                                                params.set("q", sugg);
                                                router.replace(`/search?${params.toString()}`, { scroll: false });
                                            }}
                                            className="text-bprimary-dark hover:text-bprimary font-black underline decoration-solid underline-offset-4 cursor-pointer text-sm sm:text-base ml-1"
                                        >
                                            {(data as any).didYouMean}
                                        </button>
                                        ?
                                    </p>
                                </div>
                            )}

                            {recentSearches.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-border/20 max-w-md mx-auto space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                                            Recent Searches
                                        </span>
                                        <button
                                            onClick={clearRecentSearches}
                                            className="text-[9px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {recentSearches.map((term, i) => (
                                            <div
                                                key={i}
                                                className="inline-flex items-center bg-muted/65 border border-border/40 hover:border-bprimary/30 rounded-full pl-3 pr-2 py-1 text-xs gap-1.5 transition-all animate-in fade-in duration-200"
                                            >
                                                <button
                                                    onClick={() => {
                                                        setSearchQuery(term);
                                                        setActiveQuery(term);
                                                        const params = new URLSearchParams(window.location.search);
                                                        params.set("q", term);
                                                        router.replace(`/search?${params.toString()}`, { scroll: false });
                                                    }}
                                                    className="font-semibold text-foreground/80 hover:text-foreground cursor-pointer"
                                                >
                                                    {term}
                                                </button>
                                                <button
                                                    onClick={() => removeRecentSearch(term)}
                                                    className="text-muted-foreground/60 hover:text-red-500 p-0.5 rounded-full hover:bg-muted transition-all"
                                                    aria-label={`Remove search term ${term}`}
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-4 md:gap-6 pt-2">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                config={{ showPrice: true, showVolume: true, listName: "Search Page" }}
                            />
                        ))}
                    </div>
                )}
 
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-6 border-t border-border/40 pt-8">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            className="px-4 py-2 bg-background hover:bg-muted border border-border text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all rounded-full"
                        >
                            Prev
                        </button>
                        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                            Page <span className="text-foreground">{page}</span> of {totalPages}
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                            className="px-4 py-2 bg-background hover:bg-muted border border-border text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all rounded-full"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
 
export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-bprimary animate-spin" />
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
