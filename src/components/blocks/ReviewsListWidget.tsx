'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight, X, Image as ImageIcon, MessageSquare, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewItem {
    id: string;
    type: 'internal' | 'external';
    reviewerName: string;
    content: string;
    rating: number;
    images: string[];
    source?: string;
    link: string;
    date: string;
    product?: {
        id: string;
        name: string;
        slug: string;
        image?: string;
    };
}

export default function ReviewsListWidget({ limit = 12 }: { limit?: number }) {
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const [galleryState, setGalleryState] = useState<{ isOpen: boolean, images: string[], currentIndex: number }>({
        isOpen: false, images: [], currentIndex: 0
    });

    const [filters, setFilters] = useState<{ id: string, name: string }[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<string>('');

    const fetchFilters = async () => {
        try {
            const res = await fetch('/api/storefront/reviews/filters');
            if (res.ok) {
                const data = await res.json();
                setFilters(data);
            }
        } catch (e) {
            console.error("Filter fetch err", e);
        }
    };

    const fetchReviews = useCallback(async (pageNum: number, productFilter: string) => {
        setLoading(true);
        try {
            const url = new URL('/api/storefront/reviews/all', window.location.origin);
            url.searchParams.set('page', pageNum.toString());
            url.searchParams.set('limit', limit.toString());
            if (productFilter) {
                url.searchParams.set('productId', productFilter);
            }

            const res = await fetch(url.toString());
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews || []);
                setTotalPages(data.totalPages || 1);
                setPage(data.currentPage || 1);
            }
        } catch (e) {
            console.error("Review fetch err", e);
        }
        setLoading(false);
    }, [limit]);

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        fetchReviews(page, selectedProduct);
    }, [page, selectedProduct, fetchReviews]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProduct(e.target.value);
        setPage(1); // reset to page 1
    };

    const handleNext = () => setPage(p => Math.min(p + 1, totalPages));
    const handlePrev = () => setPage(p => Math.max(p - 1, 1));

    const formatDate = (dateStr: string) => {
        try {
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            }).format(new Date(dateStr));
        } catch (e) {
            return '';
        }
    };

    return (
        <section className="w-full py-10 px-3 md:px-6 bg-background border-t border-border/60">
            <div className="max-w-7xl mx-auto">
                {/* Header Filter Panel */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 border-b border-border/50 pb-8">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-heading font-medium text-foreground relative inline-block">
                            Customer Reviews
                            <div className="absolute -bottom-1.5 left-0 w-12 h-1 bg-[#AC8717] rounded-full" />
                        </h2>
                        <p className="text-muted-foreground mt-3 text-xs md:text-sm font-light max-w-lg leading-relaxed">
                            Read genuine feedback, layered experiences, and stories from perfume collectors.
                        </p>
                    </div>

                    <div className="w-full md:w-80 shrink-0">
                        <label className="text-[10px] uppercase tracking-widest text-[#AC8717] font-black mb-1.5 block">Filter By Fragrance</label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-border/80 bg-card text-foreground focus:ring-1 focus:ring-[#AC8717]/50 focus:border-[#AC8717]/50 outline-none text-xs shadow-xs transition-all duration-300 appearance-none cursor-pointer pr-10"
                                value={selectedProduct}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Products</option>
                                {filters.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground/60 text-[10px]">
                                ▼
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="min-h-[400px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#AC8717] border-t-transparent"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center bg-card/40 rounded-3xl border border-dashed border-border/80 text-center p-8">
                        <MessageSquare className="w-10 h-10 text-muted-foreground/45 mb-3" />
                        <h3 className="font-heading font-semibold text-base text-foreground mb-1">No Reviews Found</h3>
                        <p className="text-muted-foreground text-xs font-light max-w-xs leading-relaxed">We couldn't find any reviews matching the selected filter. Try selecting another product.</p>
                    </div>
                ) : (
                    /* Masonry Columns Layout */
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 align-top">
                        {reviews.map((review) => (
                            <div key={review.id} className="break-inside-avoid mb-6 w-full inline-block align-top">
                                <div className="shadow-xs hover:shadow-[0_12px_35px_-8px_rgba(172,135,23,0.2)] hover:border-[#AC8717]/35 transition-all duration-500 bg-card border border-border/70 rounded-3xl p-6 flex flex-col h-full relative group overflow-hidden">
                                    
                                    {/* User Block */}
                                    <div className="flex items-start justify-between mb-4 gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Initial Avatar */}
                                            <div className="w-10 h-10 rounded-xl bg-[#eeeae3] border border-border/80 flex items-center justify-center font-heading font-black text-xs text-[#AC8717] uppercase shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                {review.reviewerName.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-foreground text-xs uppercase tracking-wide truncate max-w-[120px]" title={review.reviewerName}>
                                                    {review.reviewerName}
                                                </h3>
                                                <p className="text-[9px] text-muted-foreground mt-0.5">{formatDate(review.date)}</p>
                                            </div>
                                        </div>
                                        {review.type === 'external' ? (
                                            <span className="text-[8px] bg-bprimary/10 text-bprimary-dark px-2.5 py-1 rounded-full uppercase font-black tracking-widest shrink-0 border border-bprimary/15">
                                                {review.source || 'EXTERNAL'}
                                            </span>
                                        ) : (
                                            <span className="text-[8px] bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full uppercase font-black tracking-widest shrink-0 border border-emerald-500/15 flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3" /> VERIFIED
                                            </span>
                                        )}
                                    </div>

                                    {/* Stars Accents */}
                                    <div className="flex items-center gap-0.5 mb-3.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn(
                                                    "w-3.5 h-3.5 shrink-0",
                                                    i < review.rating ? "fill-[#AC8717] text-[#AC8717]" : "text-muted/20"
                                                )}
                                            />
                                        ))}
                                    </div>

                                    {/* Review Body */}
                                    <p className="text-muted-foreground/90 text-[13px] font-light leading-relaxed mb-5 italic wrap-break-word whitespace-pre-wrap">
                                        "{review.content}"
                                    </p>

                                    {/* Images Gallery */}
                                    {review.images && review.images.length > 0 && (
                                        <div className={cn("grid gap-2 mb-5", review.images.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
                                            {review.images.slice(0, 3).map((img, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => setGalleryState({ isOpen: true, images: review.images, currentIndex: i })}
                                                    className={cn(
                                                        "relative max-h-48 overflow-hidden rounded-2xl border border-border bg-muted cursor-pointer group/img",
                                                        review.images.length === 1 ? "aspect-4/3" : "aspect-square"
                                                    )}
                                                >
                                                    <img 
                                                        src={img} 
                                                        alt="Attachment" 
                                                        className="w-full h-full object-cover select-none transition-transform duration-700 group-hover/img:scale-105" 
                                                        loading="lazy" 
                                                    />
                                                    {i === 2 && review.images.length > 3 && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-xs">
                                                            <span className="text-white font-bold text-sm">+{review.images.length - 3}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Product Association & CTA */}
                                    <div className="mt-auto border-t border-border/40 pt-4 flex items-center justify-between gap-4">
                                        {review.product && (
                                            <Link href={`/product/${review.product.slug}`} className="flex items-center gap-2.5 group/link min-w-0 pr-2">
                                                {review.product.image ? (
                                                    <div className="w-8 h-8 rounded-lg shrink-0 overflow-hidden bg-muted border border-border/80">
                                                        <img src={review.product.image} className="w-full h-full object-cover" alt={review.product.name} />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg shrink-0 bg-muted flex items-center justify-center border border-border text-[9px]">🛍️</div>
                                                )}
                                                <span className="text-[10px] font-bold text-muted-foreground group-hover/link:text-[#AC8717] transition-colors truncate uppercase tracking-wider">
                                                    {review.product.name}
                                                </span>
                                            </Link>
                                        )}
                                        <a
                                            href={review.link}
                                            target={review.type === 'external' && review.link !== '#' ? "_blank" : "_self"}
                                            rel="noopener noreferrer"
                                            className="shrink-0 text-[9px] font-black text-white bg-bprimary-dark hover:bg-bprimary px-4 py-2 rounded-full transition-colors uppercase tracking-widest shadow-xs ml-auto"
                                        >
                                            Source
                                        </a>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-6 mt-16">
                        <button
                            onClick={handlePrev}
                            disabled={page === 1}
                            className="bg-card border border-border/80 text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-card w-11 h-11 flex items-center justify-center rounded-full transition-all shadow-xs group"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Page {page} <span className="opacity-50">/</span> {totalPages}
                        </span>
                        <button
                            onClick={handleNext}
                            disabled={page === totalPages}
                            className="bg-card border border-border/80 text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-card w-11 h-11 flex items-center justify-center rounded-full transition-all shadow-xs group"
                        >
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                )}

                {/* Image Gallery Modal */}
                {galleryState.isOpen && (
                    <div 
                        className="fixed inset-0 z-1000 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" 
                        onClick={() => setGalleryState(prev => ({ ...prev, isOpen: false }))}
                    >
                        <button
                            className="absolute top-6 right-6 z-50 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all"
                            onClick={(e) => { e.stopPropagation(); setGalleryState(prev => ({ ...prev, isOpen: false })); }}
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {galleryState.images.length > 1 && (
                            <>
                                <button
                                    className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 z-50 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-full transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setGalleryState(prev => ({ ...prev, currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1 }));
                                    }}
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 z-50 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-full transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setGalleryState(prev => ({ ...prev, currentIndex: prev.currentIndex === galleryState.images.length - 1 ? 0 : prev.currentIndex + 1 }));
                                    }}
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </>
                        )}

                        <div className="relative w-full max-w-4xl h-full flex flex-col justify-center gap-4" onClick={e => e.stopPropagation()}>
                            <img
                                src={galleryState.images[galleryState.currentIndex]}
                                className="w-full h-full max-h-[75vh] object-contain select-none rounded-xl"
                                alt=""
                            />

                            {/* Thumbnails */}
                            {galleryState.images.length > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                                    {galleryState.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); setGalleryState(prev => ({ ...prev, currentIndex: idx })); }}
                                            className={cn(
                                                "relative h-12 w-12 overflow-hidden rounded-lg border-2 transition-all",
                                                idx === galleryState.currentIndex ? "border-bprimary scale-110" : "border-transparent opacity-50 hover:opacity-100"
                                            )}
                                        >
                                            <img src={img} className="w-full h-full object-cover" alt="" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
