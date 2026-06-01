'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

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
        <section className="w-full py-16 px-4 md:px-8 bg-background border-y border-border">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6 border-b border-border pb-8">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground tracking-tight">Customer Reviews</h2>
                        <p className="text-muted-foreground mt-3 text-sm max-w-xl font-light">Real feedback and testimonials from our valued customers.</p>
                    </div>

                    <div className="w-full md:w-72 shrink-0">
                        <label className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2 block">Filter By Product</label>
                        <select
                            className="w-full p-4 rounded-xl border border-border bg-card text-foreground focus:ring-1 focus:ring-bprimary outline-none text-sm shadow-sm transition-shadow appearance-none"
                            value={selectedProduct}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Products</option>
                            {filters.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="min-h-[500px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bprimary"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="min-h-[400px] flex items-center justify-center bg-muted/40 rounded-3xl border border-border">
                        <p className="text-muted-foreground text-lg">No reviews found.</p>
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 align-top">
                        {reviews.map((review) => (
                            <div key={review.id} className="break-inside-avoid mb-6 w-full inline-block align-top">
                                <div className="shadow-sm hover:shadow-2xl hover:border-bprimary/30 transition-all duration-300 bg-card border border-border rounded-3xl p-5 md:p-6 flex flex-col h-full relative group overflow-hidden">
                                    <div className="flex items-start justify-between mb-4 gap-2">
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <h3 className="font-bold text-foreground truncate uppercase tracking-widest text-sm font-heading" title={review.reviewerName}>{review.reviewerName}</h3>
                                            <span className="text-[10px] text-muted-foreground mt-0.5">{formatDate(review.date)}</span>
                                            <div className="flex items-center gap-1 mt-2">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={i < review.rating ? 'currentColor' : 'none'} stroke={i < review.rating ? 'currentColor' : 'none'} strokeWidth={1.5} className={`w-4 h-4 shrink-0 ${i < review.rating ? 'text-bprimary-dark' : 'text-muted-foreground/30'}`}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </div>
                                        {review.type === 'external' ? (
                                            <span className="text-[10px] bg-bprimary/15 text-bprimary-dark px-2.5 py-1 rounded-full uppercase font-bold tracking-widest shrink-0 ml-2 border border-bprimary/20">
                                                {review.source || 'EXTERNAL'}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] bg-muted text-muted-foreground px-2.5 py-1 rounded-full uppercase font-bold tracking-widest shrink-0 ml-2 border border-border">
                                                VERIFIED
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-muted-foreground/90 text-sm font-light leading-relaxed mb-6 italic wrap-break-word whitespace-pre-wrap">
                                        "{review.content}"
                                    </p>

                                    {review.images && review.images.length > 0 && (
                                        <div className={`grid gap-2 mb-6 ${review.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                            {review.images.slice(0, 3).map((img, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => setGalleryState({ isOpen: true, images: review.images, currentIndex: i })}
                                                    className={`relative max-h-48 overflow-hidden rounded-2xl border border-border bg-muted cursor-pointer group/img ${review.images.length === 1 ? 'aspect-4/3' : 'aspect-square'}`}
                                                >
                                                    <img src={img} alt="Review attachment" className="w-full h-full object-cover select-none transition-transform duration-700 group-hover/img:scale-110" loading="lazy" />
                                                    {i === 2 && review.images.length > 3 && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                            <span className="text-white font-bold text-lg">+{review.images.length - 3}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-auto border-t border-border pt-5 flex items-center justify-between gap-4">
                                        {review.product && (
                                            <Link href={`/product/${review.product.slug}`} className="flex items-center gap-3 group/link min-w-0 pr-2">
                                                {review.product.image ? (
                                                    <div className="w-9 h-9 rounded-md shrink-0 overflow-hidden bg-muted border border-border">
                                                        <img src={review.product.image} className="w-full h-full object-cover" alt={review.product.name} />
                                                    </div>
                                                ) : (
                                                    <div className="w-9 h-9 rounded-md shrink-0 bg-muted flex items-center justify-center border border-border text-[10px] shadow-inner">🛍️</div>
                                                )}
                                                <span className="text-[11px] font-bold text-muted-foreground group-hover/link:text-bprimary transition-colors truncate uppercase tracking-wider">
                                                    {review.product.name}
                                                </span>
                                            </Link>
                                        )}
                                        <a
                                            href={review.link}
                                            target={review.type === 'external' && review.link !== '#' ? "_blank" : "_self"}
                                            rel="noopener noreferrer"
                                            className="shrink-0 text-[10px] font-bold text-background bg-foreground hover:bg-bprimary px-5 py-2.5 rounded-full transition-colors uppercase tracking-[0.2em] shadow-md ml-auto"
                                        >
                                            See Actual Review
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-6 mt-20">
                        <button
                            onClick={handlePrev}
                            disabled={page === 1}
                            className="bg-card border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:hover:bg-card w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-sm group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                            Page {page} <span className="opacity-50">/</span> {totalPages}
                        </span>
                        <button
                            onClick={handleNext}
                            disabled={page === totalPages}
                            className="bg-card border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:hover:bg-card w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-sm group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </div>
                )}
                {/* Image Gallery Modal */}
                {galleryState.isOpen && (
                    <div className="fixed inset-0 z-1000 bg-[#050505]/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8" onClick={() => setGalleryState(prev => ({ ...prev, isOpen: false }))}>
                        {/* Close button */}
                        <button
                            className="absolute top-6 right-6 z-50 text-white/50 hover:text-white bg-black/50 hover:bg-white/10 p-2 rounded-full transition-all"
                            onClick={(e) => { e.stopPropagation(); setGalleryState(prev => ({ ...prev, isOpen: false })); }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Navigation Buttons */}
                        {galleryState.images.length > 1 && (
                            <>
                                <button
                                    className="absolute left-4 sm:left-12 top-1/2 -translate-y-1/2 z-50 text-white/50 hover:text-white bg-black/50 hover:bg-white/10 p-3 rounded-full transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setGalleryState(prev => ({ ...prev, currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1 }));
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    className="absolute right-4 sm:right-12 top-1/2 -translate-y-1/2 z-50 text-white/50 hover:text-white bg-black/50 hover:bg-white/10 p-3 rounded-full transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setGalleryState(prev => ({ ...prev, currentIndex: prev.currentIndex === galleryState.images.length - 1 ? 0 : prev.currentIndex + 1 }));
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}

                        <div className="relative w-full max-w-5xl h-full flex flex-col justify-center gap-4" onClick={e => e.stopPropagation()}>
                            <img
                                src={galleryState.images[galleryState.currentIndex]}
                                className="w-full h-full max-h-[80vh] object-contain select-none"
                                alt={`Gallery item ${galleryState.currentIndex + 1}`}
                            />

                            {/* Thumbnails */}
                            {galleryState.images.length > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                                    {galleryState.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); setGalleryState(prev => ({ ...prev, currentIndex: idx })); }}
                                            className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-all ${idx === galleryState.currentIndex ? 'border-bprimary opacity-100 scale-110' : 'border-transparent opacity-50 hover:opacity-100 object-cover'}`}
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
