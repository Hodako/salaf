"use client";

import { cn } from "@/lib/utils";
import { Star, Heart, ShoppingCart, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { logSelectItem, logAddToCart } from "@/lib/gtm";
import { ProductCardProps, IVariation } from "@/types/components.types";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import dynamic from "next/dynamic";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

const ProductPreviewModal = dynamic(() => import("@/components/product/ProductPreviewModal").then(mod => mod.ProductPreviewModal), {
    ssr: false,
});

/**
 * A compact card component for displaying product previews.
 *
 * Desktop: Rounded luxury card with hover animations.
 * Mobile: Amazon/croynow.com inspired — sharp edges, full-bleed image, 
 *         zero wasted space, tight info row below image.
 */
export const ProductCard = ({
    product,
    config = { showPrice: true, showVolume: true },
    showReviews = true
}: ProductCardProps) => {
    const router = useRouter();
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const { toggleWishlist, isInWishlist } = useWishlist();
    const isWishlisted = isInWishlist(product._id);
    const isOnSale = !!product.isOnSale;
    const hasSaleTrigger = product.variations?.some((v: IVariation) => v.salePrice && v.salePrice < v.basePrice);

    const { addToCart, cart = [], setIsCartOpen } = useCart();

    const preloadImage = (src: string) => {
        if (!src || typeof window === 'undefined') return;
        const img = new window.Image();
        img.src = src;
    };

    const handlePrefetch = () => {
        // Prefetch the Next.js router data & bundles
        router.prefetch(`/product/${product.slug}`);

        // Preload the product images into browser cache via Service Worker
        if (product.featuredImage) {
            preloadImage(product.featuredImage);
        }
        if (product.images && product.images.length > 0) {
            product.images.slice(0, 3).forEach((img: string) => {
                preloadImage(img);
            });
        }
    };

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!product.variations || product.variations.length === 0) return;
        const activeVar = product.variations[0];
        const isAlreadyIn = cart && Array.isArray(cart) && cart.some(
            (item) => item.productId === product._id && item.variationIdx === 0
        );
        if (isAlreadyIn) {
            setIsCartOpen(true);
            return;
        }
        logAddToCart(product, activeVar, 1);
        addToCart({
            productId: product._id,
            productName: product.name,
            featuredImage: product.featuredImage || product.images?.[0],
            variationIdx: 0,
            volume: `${activeVar.volume}${activeVar.volumeUnit}`,
            price: activeVar.salePrice || activeVar.basePrice,
            quantity: 1,
            slug: product.slug,
            sku: activeVar.sku,
            variantType: activeVar.variantType
        });
        setIsCartOpen(true);
    };

    const handleQuickBuy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!product.variations || product.variations.length === 0) return;
        const activeVar = product.variations[0];
        const isAlreadyIn = cart && Array.isArray(cart) && cart.some(
            (item) => item.productId === product._id && item.variationIdx === 0
        );
        if (!isAlreadyIn) {
            logAddToCart(product, activeVar, 1);
            addToCart({
                productId: product._id,
                productName: product.name,
                featuredImage: product.featuredImage || product.images?.[0],
                variationIdx: 0,
                volume: `${activeVar.volume}${activeVar.volumeUnit}`,
                price: activeVar.salePrice || activeVar.basePrice,
                quantity: 1,
                slug: product.slug,
                sku: activeVar.sku,
                variantType: activeVar.variantType
            });
        }
        window.location.href = "/checkout";
    };

    const getPriceDisplay = (volumeText?: string) => {
        if (!product.variations || product.variations.length === 0) return null;

        const basePrices = product.variations.map((v: IVariation) => v.basePrice);
        const salePrices = product.variations.map((v: IVariation) => v.salePrice).filter((p: number | undefined): p is number => p !== undefined);

        const minBase = Math.min(...basePrices);
        const maxBase = Math.max(...basePrices);

        const hasSale = salePrices.length > 0;

        let minSale = hasSale ? Math.min(...salePrices) : null;
        let maxSale = hasSale ? Math.max(...salePrices) : null;

        if (hasSale && salePrices.length < basePrices.length) {
            const allEffectivePrices = product.variations.map((v: IVariation) => v.salePrice || v.basePrice);
            minSale = Math.min(...allEffectivePrices);
            maxSale = Math.max(...allEffectivePrices);
        }

        const renderRange = (min: number, max: number) => {
            return min === max ? `৳ ${min.toLocaleString()}` : `৳ ${min.toLocaleString()} - ৳ ${max.toLocaleString()}`;
        };

        return (
            <div className="flex flex-col items-center">
                {hasSaleTrigger && (
                    <span className="text-[10px] md:text-xs text-muted-foreground/60 line-through decoration-red-500/40">
                        {renderRange(minBase, maxBase)}
                    </span>
                )}
                <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="text-bprimary-dark tracking-wide font-bold text-sm md:text-lg">
                        {hasSaleTrigger ? renderRange(minSale!, maxSale!) : renderRange(minBase, maxBase)}
                    </span>
                    {volumeText && (
                        <>
                            <span className="text-muted-foreground/30 text-[10px] md:text-xs">|</span>
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                                {volumeText}
                            </span>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const hasMultipleVariants = (product.variations || []).length > 1;

    const handleClick = () => {
        logSelectItem(product, config.listName || "Product List");
    };

    /* ── Mobile price helpers ─────────────────────────────────────── */
    const getMobilePrices = () => {
        if (!product.variations || product.variations.length === 0) return { sale: null, base: null };
        const basePrices = product.variations.map((v: IVariation) => v.basePrice);
        const salePrices = product.variations.map((v: IVariation) => v.salePrice).filter((p): p is number => p !== undefined);
        const minBase = Math.min(...basePrices);
        const maxBase = Math.max(...basePrices);
        const hasSale = salePrices.length > 0;
        const minSale = hasSale ? Math.min(...salePrices) : null;
        const maxSale = hasSale ? Math.max(...salePrices) : null;
        const renderRange = (min: number, max: number) =>
            min === max ? `৳${min.toLocaleString()}` : `৳${min.toLocaleString()}–৳${max.toLocaleString()}`;
        return {
            sale: hasSale ? renderRange(minSale!, maxSale!) : null,
            base: renderRange(minBase, maxBase),
        };
    };

    const { sale: mobileSalePrice, base: mobileBasePrice } = getMobilePrices();

    return (
        <>
            {/* ═══════════════════════════════════════════════════════════
                DESKTOP VERSION — luxury rounded card (lg and above)
            ════════════════════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onMouseEnter={handlePrefetch}
                onFocusCapture={handlePrefetch}
                className={cn("hidden lg:flex flex-col rounded-[2rem] overflow-hidden transition-all duration-700 bg-white group cursor-pointer h-full w-full max-w-[320px] mx-auto shrink-0 relative border border-black/5 shadow-sm hover:shadow-xl hover:shadow-black/10")}
            >
                {/* Entire Card Absolute Overlay Link for Instant Navigation on Desktop */}
                <Link
                    href={`/product/${product.slug}`}
                    onClick={handleClick}
                    className="absolute inset-0 z-10"
                    aria-label={product.name}
                />

                {/* Image Container */}
                <div className="relative w-full aspect-300/410 overflow-hidden bg-white transition-all duration-500 shadow-sm shadow-black/5 group-hover:shadow-xl group-hover:shadow-black/10">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={product.featuredImage || product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="300px"
                        />
                    </div>

                    {/* Sale Badge */}
                    {isOnSale && (
                        <div className="absolute top-4 left-4 z-20">
                            <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-lg">
                                Sale
                            </span>
                        </div>
                    )}

                    {/* Top Actions Overlay */}
                    <div className={cn("absolute top-6 right-6 z-20 flex flex-col gap-3 transition-all duration-500", "opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0")}>
                        <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsPreviewOpen(true);
                            }}
                            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-foreground shadow-lg hover:text-bprimary-dark transition-all cursor-pointer"
                        >
                            <Eye className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleWishlist(product._id);
                            }}
                            className={cn("w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg transition-all cursor-pointer", isWishlisted ? "text-red-500" : "text-foreground hover:text-red-500")}
                        >
                            <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
                        </motion.button>
                    </div>

                    {/* Desktop Hover Button */}
                    <div className={cn("absolute bottom-5 left-5 right-5 z-20 transition-all duration-500 transform", "opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto")}>
                        <Button
                            variant="outline"
                            className="w-full h-10 bg-white/95 backdrop-blur-sm border-white/50 text-bprimary-dark font-bold uppercase tracking-[0.15em] text-[10px] rounded-full hover:bg-bprimary-dark hover:text-white hover:border-bprimary-dark hover:shadow-xl transition-all duration-500 shadow-lg cursor-pointer"
                        >
                            <ShoppingBag className="w-3.5 h-3.5 mr-2" />
                            Select Options
                        </Button>
                    </div>
                </div>

                {/* Content Container */}
                <div className="p-4 flex flex-col items-center justify-center text-center gap-3 relative z-0">
                    <div className="space-y-1 w-full">
                        <h3 className="text-sm font-heading font-bold uppercase tracking-[0.15em] text-foreground/90 group-hover:text-bprimary-dark transition-colors line-clamp-1">
                            {product.name}
                        </h3>

                        <div className="flex flex-col items-center justify-center">
                            {config.showPrice && product.variations?.[0] && (
                                getPriceDisplay(
                                    config.showVolume && !hasMultipleVariants
                                        ? `${product.variations[0].volume} ${product.variations[0].volumeUnit}`
                                        : undefined
                                )
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════
                MOBILE VERSION — Amazon / croynow.com style
                ▸ Sharp edges (0 border-radius)
                ▸ Image fills 100% of card width, zero padding
                ▸ No empty white space — info sits flush below image
                ▸ Compact action row at bottom
            ════════════════════════════════════════════════════════════ */}
            <motion.div
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                onMouseEnter={handlePrefetch}
                onFocusCapture={handlePrefetch}
                className="flex lg:hidden flex-col w-full bg-white overflow-hidden border border-[#ebe3d4] relative group cursor-pointer shadow-[0_1px_2px_rgba(41,30,18,0.04)] hover:shadow-[0_4px_12px_rgba(41,30,18,0.1)] active:bg-amber-50/40 transition-colors"
            >
                {/* Entire Card Absolute Overlay Link for Instant Navigation on Mobile */}
                <Link
                    href={`/product/${product.slug}`}
                    onClick={handleClick}
                    className="absolute inset-0 z-10"
                    aria-label={product.name}
                />

                {/* ── Full-bleed Image ── */}
                <div
                    className="relative block w-full overflow-hidden bg-white"
                    style={{ aspectRatio: "1 / 1.06" }}
                >
                    <Image
                        src={product.featuredImage || product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover relative z-10 transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 33vw"
                        priority
                    />

                    {/* Sale badge — top-left, sharp */}
                    {isOnSale && (
                        <span className="absolute top-1 left-1 z-20 bg-red-600 text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 leading-none rounded-sm">
                            SALE
                        </span>
                    )}

                    {/* Wishlist — top-right */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product._id);
                        }}
                        className={cn(
                            "absolute top-1 right-1 z-20 w-6 h-6 bg-white/92 rounded-full flex items-center justify-center shadow-sm transition-all active:scale-90 cursor-pointer",
                            isWishlisted ? "text-red-500" : "text-gray-500"
                        )}
                    >
                        <Heart className={cn("w-3 h-3", isWishlisted && "fill-current")} />
                    </button>
                </div>

                {/* ── Info Block — zero gap from image ── */}
                <div className="flex flex-col px-1.5 pt-1.5 pb-1.5 gap-1 bg-white relative z-0">

                    {/* Product name */}
                    <div>
                        <h3 className="text-[10px] font-semibold text-gray-950 leading-[1.2] line-clamp-2 font-sans min-h-[24px]">
                            {product.name}
                        </h3>
                    </div>

                    {/* Price row — Premium 1-line range layout with corner base price */}
                    <div className="relative flex flex-col w-full min-h-[22px] justify-center">
                        {mobileSalePrice ? (
                            <>
                                <span className="absolute top-[-3px] right-0 text-[7px] font-black text-gray-400 line-through leading-none scale-90 origin-top-right">
                                    {mobileBasePrice}
                                </span>
                                <span className="text-[10px] font-black text-red-600 leading-none whitespace-nowrap overflow-hidden text-ellipsis w-full mt-2">
                                    {mobileSalePrice}
                                </span>
                            </>
                        ) : (
                            <span className="text-[10px] font-black text-[#A67C00] leading-none whitespace-nowrap overflow-hidden text-ellipsis w-full">
                                {mobileBasePrice}
                            </span>
                        )}
                    </div>

                    {/* Action row — Amazon-style: Buy Now + Cart icon */}
                    <div className="flex gap-1 mt-0.5 relative z-20">
                        <button
                            onClick={handleQuickBuy}
                            className="flex-1 h-6 rounded-sm bg-[#d4af37] hover:bg-[#c49d2e] active:bg-[#b68e22] text-white font-black text-[7.5px] uppercase tracking-[0.06em] transition-colors leading-none cursor-pointer"
                        >
                            Buy Now
                        </button>
                        <button
                            onClick={handleQuickAdd}
                            className="w-6 h-6 rounded-sm flex items-center justify-center shrink-0 bg-[#0c0a07] hover:bg-[#2a2117] active:bg-black transition-colors cursor-pointer"
                            title="Add to Cart"
                        >
                            <ShoppingCart className="w-2.5 h-2.5 text-white" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {isPreviewOpen && (
                <ProductPreviewModal
                    product={product}
                    isOpen={isPreviewOpen}
                    onOpenChange={setIsPreviewOpen}
                />
            )}
        </>
    );
};
