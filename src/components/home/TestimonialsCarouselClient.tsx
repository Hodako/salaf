'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { IExternalReviewDocument } from '@/types/models.types';

/**
 * A client-side carousel component for displaying customer testimonials.
 * 
 * Features auto-advancing slides, manual navigation arrows, and dot 
 * indicators. Uses a smooth opacity transition for slide changes.
 */
interface Props {
    reviews: IExternalReviewDocument[];
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={i < rating ? 'currentColor' : 'none'}
                    stroke={i < rating ? 'currentColor' : 'none'}
                    strokeWidth={1.5}
                    className={`w-4 h-4 md:w-5 md:h-5 shrink-0 ${i < rating ? 'text-bprimary-dark' : 'text-muted-foreground/20'}`}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                </svg>
            ))}
        </div>
    );
}

export default function TestimonialsCarouselClient({ reviews }: Props) {
    const [current, setCurrent] = useState(0);
    const [animating, setAnimating] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const currentRef = useRef(0); // Track current without causing effect re-runs
    const animatingRef = useRef(false); // Same for animating
    const total = reviews.length;

    // Keep refs in sync with state
    useEffect(() => { currentRef.current = current; }, [current]);
    useEffect(() => { animatingRef.current = animating; }, [animating]);

    // A stable "advance to index" function that uses refs (no stale closures)
    const goTo = useCallback((index: number) => {
        if (animatingRef.current) return;
        animatingRef.current = true;
        setAnimating(true);
        setTimeout(() => {
            setCurrent(index);
            currentRef.current = index;
            animatingRef.current = false;
            setAnimating(false);
        }, 350);
    }, []); // No deps — uses refs internally

    // Stable next/prev that always read from refs
    const goNext = useCallback(() => {
        goTo((currentRef.current + 1) % total);
    }, [goTo, total]);

    const goPrev = useCallback(() => {
        goTo((currentRef.current - 1 + total) % total);
    }, [goTo, total]);

    // Auto-advance: interval is created once and never torn down by slide changes
    const startInterval = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            goTo((currentRef.current + 1) % total);
        }, 5000);
    }, [goTo, total]);

    useEffect(() => {
        startInterval();
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [startInterval]);

    const pause = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, []);

    const resume = useCallback(() => {
        startInterval();
    }, [startInterval]);

    const review = reviews[current];

    return (
        <section className="w-full bg-[#f5f5f5] py-3.5 md:py-8 px-4 overflow-hidden">
            <div className="max-w-4xl mx-auto">
                {/* Section heading */}
                <div className="text-center mb-3">
                    <p className="text-[9px] md:text-[10px] text-bprimary-dark tracking-[0.3em] uppercase font-heading mb-1">
                        What They Say
                    </p>
                    <h2 className="text-lg md:text-2xl font-heading font-bold text-foreground">
                        Our Customers Say
                    </h2>
                </div>

                {/* Carousel */}
                <div
                    className="relative flex items-center justify-center gap-4 md:gap-8"
                    onMouseEnter={pause}
                    onMouseLeave={resume}
                >
                    {/* Prev Arrow */}
                    <button
                        onClick={goPrev}
                        aria-label="Previous testimonial"
                        className="shrink-0 w-8 h-8 md:w-12 md:h-12 rounded-full border border-border bg-muted hover:border-bprimary-dark hover:bg-bprimary/10 text-muted-foreground hover:text-bprimary-dark flex items-center justify-center transition-all duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>

                    {/* Review Card */}
                    <div
                        className="flex-1 text-center transition-opacity duration-300 px-2 md:px-8"
                        style={{ opacity: animating ? 0 : 1 }}
                    >
                        {/* Large decorative quote */}
                        <span className="text-4xl md:text-6xl font-heading text-bprimary-dark/20 leading-none select-none block -mb-4 md:-mb-6">
                            &ldquo;
                        </span>

                        {/* Fixed-height content container for consistency */}
                        <div className="min-h-[85px] md:h-[160px] flex items-center justify-center mb-2.5 sm:mb-4">
                            <p className="text-xs md:text-base text-muted-foreground font-light leading-relaxed italic line-clamp-6 overflow-hidden">
                                {review.content}
                            </p>
                        </div>

                        <StarRating rating={review.rating} />

                        <p className="mt-3 md:mt-4 text-xs md:text-sm font-bold text-foreground uppercase tracking-widest font-heading">
                            — {review.reviewerName}
                        </p>
                    </div>

                    {/* Next Arrow */}
                    <button
                        onClick={goNext}
                        aria-label="Next testimonial"
                        className="shrink-0 w-8 h-8 md:w-12 md:h-12 rounded-full border border-border bg-muted hover:border-bprimary-dark hover:bg-bprimary/10 text-muted-foreground hover:text-bprimary-dark flex items-center justify-center transition-all duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>

                {/* Dot indicators */}
                <div className="flex items-center justify-center gap-2 mt-5 md:mt-10">
                    {reviews.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            aria-label={`Go to review ${i + 1}`}
                            onMouseEnter={pause}
                            onMouseLeave={resume}
                            className={`transition-all duration-300 rounded-full ${i === current
                                ? 'w-6 h-2 bg-bprimary-dark'
                                : 'w-2 h-2 bg-muted-foreground/20 hover:bg-muted-foreground/40'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
