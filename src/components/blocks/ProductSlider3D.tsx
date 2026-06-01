"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";

/**
 * Interface for the ProductSlider3D component props.
 */
interface ProductSlider3DProps {
    title?: string;
    productSlugs?: string;
}

/**
 * Collection of gradient backgrounds for the sliding product cards.
 */
const PRESET_GRADIENTS = [
    "bg-gradient-to-br from-[#f46a4e] via-[#e94422] to-[#b92b10]",
    "bg-gradient-to-br from-[#1f1f1f] via-[#0a0a0a] to-[#000000]",
    "bg-gradient-to-br from-[#385431] via-[#1e3019] to-[#0c150a]",
    "bg-gradient-to-br from-[#472616] via-[#2e170d] to-[#180b06]",
    "bg-gradient-to-br from-[#152b3c] via-[#0b1721] to-[#04090e]",
    "bg-gradient-to-br from-[#4a1120] via-[#2d0a13] to-[#140408]",
];

/**
 * Interactive 3D product display carousel featuring depth perspective and automatic rotation.
 * Primarily used for landing pages and CMS homepage blocks.
 */
export function ProductSlider3D({ title = "Weekly Bestsellers", productSlugs = "" }: ProductSlider3DProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(true);
    const { addToCart } = useCart();
    
    const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

    // Load and filter products based on component configuration props
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                if (!productSlugs) {
                    // Fetch popular products as a fallback
                    const res = await axios.get("/api/products?limit=6&sort=popularity");
                    setProducts(res.data.products || []);
                } else {
                    const slugs = productSlugs.split(",").filter(Boolean).join(",");
                    const res = await axios.get(`/api/products?slugs=${slugs}`);
                    
                    // Reorder products according to the configured slugs array
                    const fetched = res.data.products || [];
                    const orderMap = productSlugs.split(",").filter(Boolean);
                    const ordered = orderMap
                        .map(s => fetched.find((p: any) => p.slug === s))
                        .filter(Boolean);
                        
                    setProducts(ordered.length > 0 ? ordered : fetched);
                }
            } catch (error) {
                console.error("Failed to load products for 3D slider:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [productSlugs]);

    // Handles automatic transition timer
    useEffect(() => {
        if (products.length <= 1 || !isAutoplay) return;
        
        autoplayTimer.current = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % products.length);
        }, 5000);

        return () => {
            if (autoplayTimer.current) clearInterval(autoplayTimer.current);
        };
    }, [products.length, isAutoplay]);

    if (isLoading) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-24 min-h-[400px]">
                <Loader2 className="w-8 h-8 text-bprimary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground tracking-widest uppercase">Loading products...</p>
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    const handlePrev = () => {
        setIsAutoplay(false);
        setActiveIndex(prev => (prev - 1 + products.length) % products.length);
    };

    const handleNext = () => {
        setIsAutoplay(false);
        setActiveIndex(prev => (prev + 1) % products.length);
    };

    const selectIndex = (index: number) => {
        setIsAutoplay(false);
        setActiveIndex(index);
    };

    // Helper to determine the relative positioning index loop offsets
    const getOffsetIndex = (index: number) => {
        let offset = index - activeIndex;
        const len = products.length;
        
        offset = ((offset % len) + len) % len;
        if (offset > len / 2) offset -= len;
        
        return offset;
    };

    return (
        <section 
            className="w-full py-16 md:py-24 bg-white flex flex-col items-center overflow-hidden select-none"
            aria-label="Featured collection slider"
            onMouseEnter={() => setIsAutoplay(false)}
            onMouseLeave={() => setIsAutoplay(true)}
        >
            <div className="text-center mb-12 md:mb-16 px-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black font-sans">
                    {title}
                </h2>
                <div className="w-12 h-1 bg-bprimary mx-auto mt-4 rounded-full" />
            </div>

            {/* Card viewport wrapper */}
            <div className="relative w-full max-w-7xl h-[400px] sm:h-[450px] md:h-[550px] flex items-center justify-center perspective-[1200px] px-4">
                {products.map((product, idx) => {
                    const offset = getOffsetIndex(idx);
                    const absOffset = Math.abs(offset);
                    const isVisible = absOffset <= 2;

                    if (!isVisible) return null;

                    const gradient = PRESET_GRADIENTS[idx % PRESET_GRADIENTS.length];
                    const imageUrl = product.featuredImage || (product.images && product.images[0]?.url) || (product.images && product.images[0]);

                    return (
                        <div
                            key={product._id}
                            onClick={() => offset !== 0 && selectIndex(idx)}
                            className={cn(
                                "absolute w-[260px] sm:w-[300px] md:w-[360px] aspect-3/4 rounded-2xl md:rounded-[24px] shadow-2xl cursor-pointer overflow-hidden transition-all duration-700 ease-out border border-white/10 select-none flex flex-col justify-between p-6 md:p-8",
                                gradient,
                                offset !== 0 && "hover:brightness-110"
                            )}
                            style={{
                                zIndex: 30 - absOffset * 10,
                                transform: `
                                    translateX(calc(${offset * 40}% + ${offset * 0}px))
                                    scale(${1 - absOffset * 0.15})
                                    rotateY(${offset * -20}deg)
                                    translateZ(${-absOffset * 100}px)
                                `,
                                opacity: 1 - absOffset * 0.25,
                                filter: absOffset > 0 ? `blur(${absOffset * 0.8}px)` : "none",
                                pointerEvents: absOffset > 2 ? "none" : "auto",
                            }}
                        >
                            {/* Bottom-to-top ambient gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/5 pointer-events-none z-10" />
                            
                            {/* Brand information and product label */}
                            <div className="relative z-20 flex flex-col items-center text-center text-white mt-2">
                                <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.25em] opacity-80 mb-2 drop-shadow-sm">
                                    {product.brand?.name || "SALAF EXCLUSIVE"}
                                </span>
                                <h3 className="text-2xl md:text-3xl font-bold uppercase font-sans tracking-wide leading-tight drop-shadow-md truncate w-full">
                                    {product.name}
                                </h3>
                            </div>

                            {/* Center item graphics */}
                            <div className="relative flex-1 w-full flex items-center justify-center py-4 z-10">
                                {imageUrl ? (
                                    <div className="relative w-full h-full max-h-[75%] aspect-square transition-transform duration-700 group-hover:scale-105 drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)]">
                                        <Image
                                            src={imageUrl}
                                            alt={product.name}
                                            fill
                                            sizes="360px"
                                            className="object-contain"
                                            priority={absOffset === 0}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-black/20 rounded flex items-center justify-center">
                                        <span className="text-white/30 text-xs font-mono">Fragrance</span>
                                    </div>
                                )}
                            </div>

                            {/* Call to action navigation */}
                            <div className="relative z-20 w-full flex flex-col items-center gap-3">
                                {absOffset === 0 ? (
                                    <Link 
                                        href={`/products/${product.slug}`}
                                        className="px-8 py-2.5 rounded-full bg-bprimary hover:bg-[#e5c04f] text-black font-bold text-xs md:text-sm uppercase tracking-widest transition-all duration-300 hover:scale-105 text-center shadow-lg border border-bprimary"
                                    >
                                        Buy Now
                                    </Link>
                                ) : (
                                    <div 
                                        className="px-8 py-2.5 rounded-full border border-white/40 text-white font-bold text-xs uppercase tracking-widest text-center opacity-60"
                                    >
                                        View Product
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controls row */}
            <div className="flex flex-col items-center gap-6 mt-12 z-40">
                <div className="flex items-center gap-12">
                    <button 
                        onClick={handlePrev}
                        className="w-12 h-12 flex items-center justify-center rounded-full border border-black/10 text-black hover:bg-black hover:text-white hover:border-black transition-all shadow-sm cursor-pointer group-active:scale-95"
                        aria-label="Previous item"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Progress pill indicators */}
                    <div className="flex items-center gap-3">
                        {products.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => selectIndex(i)}
                                className={cn(
                                    "h-2 rounded-full transition-all duration-300 cursor-pointer",
                                    i === activeIndex ? "w-8 bg-bprimary" : "w-2 bg-bprimary/30 hover:bg-bprimary/60"
                                )}
                                aria-label={`Go to slider index ${i + 1}`}
                            />
                        ))}
                    </div>

                    <button 
                        onClick={handleNext}
                        className="w-12 h-12 flex items-center justify-center rounded-full border border-black/10 text-black hover:bg-black hover:text-white hover:border-black transition-all shadow-sm cursor-pointer group-active:scale-95"
                        aria-label="Next item"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </section>
    );
}
