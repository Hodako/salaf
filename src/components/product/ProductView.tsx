"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Star, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductViewProps } from "@/types";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { logViewItem, logAddToCart } from "@/lib/gtm";

/**
 * The main product detail view component.
 */
export function ProductView({ product, reviewStats }: ProductViewProps) {
    const router = useRouter();
    const [selectedIdx, setSelectedIdx] = useState<number>(0);
    const [qty, setQty] = useState(1);
    const [activeImg, setActiveImg] = useState(product.featuredImage || (product.images && product.images[0]));

    // Consolidate unique images: Featured + Gallery (Variant images hidden here as requested)
    const allGalleryImages = useMemo(() => {
        const set = new Set<string>();
        if (product.featuredImage) set.add(product.featuredImage);
        product.images?.forEach(img => set.add(img));
        return Array.from(set);
    }, [product.featuredImage, product.images]);

    // Update active image when variation with specific image is selected
    useEffect(() => {
        const variationImage = product.variations[selectedIdx]?.image;
        if (variationImage) {
            setActiveImg(variationImage);
        }
    }, [selectedIdx, product.variations]);



    const activeVariation = (product.variations && product.variations[selectedIdx]) || null;
    const isOutOfStock = !!(activeVariation && activeVariation.stock !== undefined && Number(activeVariation.stock) <= 0);
    const price = activeVariation?.salePrice || activeVariation?.basePrice || 0;

    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart, cart = [], setIsCartOpen } = useCart();
    const isWishlisted = isInWishlist(product._id);

    const isAlreadyInCart = !!(cart && Array.isArray(cart) && cart.some(
        (item) => item.productId === product._id && item.variationIdx === selectedIdx
    ));

    // Google Tag: view_item
    useEffect(() => {
        logViewItem(product);
    }, [product]);

    const handleAddToCart = () => {
        if (!activeVariation) return;

        if (isAlreadyInCart) {
            setIsCartOpen(true);
            return;
        }

        logAddToCart(product, activeVariation, qty);
        addToCart({
            productId: product._id,
            productName: product.name,
            featuredImage: product.featuredImage,
            variationIdx: selectedIdx,
            volume: `${activeVariation.volume}${activeVariation.volumeUnit}`,
            price: price,
            quantity: qty,
            slug: product.slug,
            sku: activeVariation.sku,
            variantType: activeVariation.variantType
        });
    };

    const handleBuyNow = () => {
        if (!activeVariation) return;

        if (!isAlreadyInCart) {
            logAddToCart(product, activeVariation, qty);
            addToCart({
                productId: product._id,
                productName: product.name,
                featuredImage: product.featuredImage,
                variationIdx: selectedIdx,
                volume: `${activeVariation.volume}${activeVariation.volumeUnit}`,
                price: price,
                quantity: qty,
                slug: product.slug,
                sku: activeVariation.sku,
                variantType: activeVariation.variantType
            });
        }
        router.push("/checkout");
    };

    return (
        <section className="flex flex-col md:flex-row gap-2.5 md:gap-8 lg:gap-10 mb-8 md:mb-12 px-0 md:px-0 pb-24 md:pb-0">
            {/* JSON-LD Schema for Rich Results */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        "name": product.name,
                        "image": allGalleryImages,
                        "description": product.seoDescription || product.name,
                        "sku": activeVariation?.sku || product.skuPrefix,
                        "brand": {
                            "@type": "Brand",
                            "name": product.brand && typeof product.brand !== 'string' ? (product.brand as any).name : "Salaf"
                        },
                        "aggregateRating": reviewStats.totalReviews > 0 ? {
                            "@type": "AggregateRating",
                            "ratingValue": Number(reviewStats.avgRating.toFixed(1)),
                            "reviewCount": reviewStats.totalReviews,
                            "bestRating": "5",
                            "worstRating": "1"
                        } : undefined,
                        "offers": {
                            "@type": "AggregateOffer",
                            "priceCurrency": "BDT",
                            "lowPrice": (product.variations && product.variations.length > 0) ? Math.min(...product.variations.map((v: any) => Number(v.salePrice || v.basePrice))) : 0,
                            "highPrice": (product.variations && product.variations.length > 0) ? Math.max(...product.variations.map((v: any) => Number(v.salePrice || v.basePrice))) : 0,
                            "offerCount": product.variations?.length || 0,
                            "offers": product.variations?.map((v: any) => ({
                                "@type": "Offer",
                                "price": Number(v.salePrice || v.basePrice),
                                "priceCurrency": "BDT",
                                "availability": v.stock !== undefined && Number(v.stock) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                                "sku": v.sku,
                                "priceValidUntil": "2027-12-31"
                            })) || []
                        },
                        "additionalProperty": product.attributes?.map((attr: any) => ({
                            "@type": "PropertyValue",
                            "name": attr.key,
                            "value": attr.value
                        }))
                    })
                }}
            />
            
            {/* Left: Product Gallery */}
            <div className="w-full md:w-1/2 flex flex-col gap-2 md:gap-4">
                <div className="relative w-full h-[380px] sm:h-[440px] md:h-[480px] overflow-hidden group rounded-none md:rounded-2xl bg-[#AC8717]/10 border-y md:border border-[#AC8717]/20">
                    <Image
                        src={activeImg}
                        alt=""
                        fill
                        className="object-cover scale-110 blur-2xl opacity-45 md:hidden"
                        sizes="100vw"
                        aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-white/55 md:hidden" aria-hidden="true" />
                    <Image
                        src={activeImg}
                        alt={product.name}
                        fill
                        className="object-contain p-1.5 sm:p-4 transition-transform duration-700 group-hover:scale-105 relative z-10"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                    />
                </div>
                {/* Thumbnails */}
                {allGalleryImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto px-2 pb-1 scrollbar-none justify-start md:justify-center w-full">
                        {allGalleryImages.map((img: string, i: number) => (
                            <button
                                key={i}
                                onClick={() => setActiveImg(img)}
                                className={cn(
                                    "relative w-12 sm:w-16 aspect-square rounded-lg sm:rounded-xl overflow-hidden transition-all shrink-0 border bg-background",
                                    activeImg === img ? "border-[#AC8717] ring-2 ring-[#AC8717]/20" : "opacity-60 border-border hover:opacity-100"
                                )}
                            >
                                <Image src={img} alt="" fill className="object-cover p-1.5" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Hidden Preload Container for Variant Images */}
                <div className="hidden pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
                    {product.variations?.map((v: any, i: number) => v.image && (
                        <Image key={i} src={v.image} alt="" width={1} height={1} />
                    ))}
                </div>
            </div>

            {/* Right: Product Info & Buy Box */}
            <div className="w-full md:w-1/2 flex flex-col space-y-2.5 md:space-y-3 pt-0 px-3 md:px-0">
                {/* Brand Store Link */}
                <div>
                    {product.brand && typeof product.brand !== 'string' && 'slug' in product.brand ? (
                        <Link
                            href={`/brands/${(product.brand as any).slug}`}
                            className="text-[10px] font-black text-[#AC8717] hover:text-[#8f6f12] hover:underline tracking-wider uppercase transition-colors"
                        >
                            Visit the {(product.brand as any).name} Store
                        </Link>
                    ) : (
                        <span className="text-[10px] font-black text-muted-foreground tracking-wider uppercase">
                            Brand: Salaf
                        </span>
                    )}
                </div>

                <div className="space-y-1">
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-[19px] sm:text-2xl md:text-3xl font-heading font-semibold text-foreground tracking-wide flex-1 leading-tight">
                            {product.name}
                        </h1>
                        {product.brand && typeof product.brand !== 'string' && 'slug' in product.brand && (product.brand as any).logo && (
                            <Link
                                href={`/brands/${(product.brand as any).slug}`}
                                className="shrink-0 border border-border rounded-lg shadow-xs hover:shadow-sm transition-all bg-card"
                                title={(product.brand as any).name}
                            >
                                <div className="w-10 h-10 md:w-14 md:h-14 relative rounded-md overflow-hidden bg-white">
                                    <Image
                                        src={(product.brand as any).logo}
                                        alt={(product.brand as any).name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </Link>
                        )}
                    </div>
                    <p className="text-muted-foreground text-[11px] sm:text-sm font-light leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-none">
                        {product.seoDescription || "A celebration of sophistication, crafted with the finest essences."}
                    </p>
                </div>

                {/* Star Rating & Review Count */}
                {reviewStats.totalReviews > 0 && (
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}>
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    className={cn("w-3.5 h-3.5 fill-[#AC8717] text-[#AC8717]", s > Math.round(reviewStats.avgRating) ? "opacity-20 text-muted-foreground/30 fill-transparent" : "opacity-100"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] font-bold text-[#AC8717] hover:text-[#8f6f12] hover:underline uppercase tracking-wider transition-colors">
                            {reviewStats.avgRating.toFixed(1)} out of 5 • {reviewStats.totalReviews} customer reviews
                        </span>
                    </div>
                )}

                <hr className="border-border/40" />

                {/* Variations Selector */}
                <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Select Variant Size</div>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        {product.variations.map((v: any, i: number) => (
                            <button
                                key={i}
                                onClick={() => setSelectedIdx(i)}
                                className={cn(
                                    "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl border text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 bg-background",
                                    selectedIdx === i
                                        ? "border-[#AC8717] text-[#AC8717] bg-[#AC8717]/5 shadow-xs"
                                        : "border-border text-muted-foreground hover:border-[#AC8717]/30"
                                )}
                            >
                                {v.image && (
                                    <div className="relative w-4 h-4 rounded-full overflow-hidden border border-border/80 shrink-0">
                                        <Image src={v.image} alt="" fill className="object-cover" />
                                    </div>
                                )}
                                <span>{v.volume}{v.volumeUnit} {v.variantType ? `(${v.variantType})` : ""}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Amazon "Buy Box" Card wrapper */}
                <div className="border border-[#AC8717]/25 bg-white/70 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-5 shadow-xs space-y-2.5 md:space-y-3.5 mt-1 md:mt-2">
                    {/* Price & Savings Display */}
                    <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-[26px] md:text-3xl font-extrabold tracking-wide text-[#AC8717] leading-none">
                                ৳ {price.toLocaleString()}
                            </span>
                            {activeVariation?.salePrice && activeVariation?.basePrice && activeVariation.basePrice > activeVariation.salePrice && (
                                <span className="text-sm md:text-base text-muted-foreground line-through price-strike">
                                    ৳ {activeVariation.basePrice.toLocaleString()}
                                </span>
                            )}
                        </div>
                        
                        {activeVariation?.salePrice && activeVariation?.basePrice && activeVariation.basePrice > activeVariation.salePrice && (
                            <div className="text-[10px] sm:text-[11px] font-semibold text-green-600">
                                You Save: ৳ {(activeVariation.basePrice - activeVariation.salePrice).toLocaleString()} ({Math.round(((activeVariation.basePrice - activeVariation.salePrice) / activeVariation.basePrice) * 100)}%)
                            </div>
                        )}
                    </div>

                    {/* Stock Alert / Urgency */}
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            isOutOfStock ? "bg-red-500" : (activeVariation && activeVariation.stock !== undefined && Number(activeVariation.stock) < 5) ? "bg-[#AC8717] animate-ping" : "bg-green-500"
                        )} />
                        {isOutOfStock ? (
                            <span className="text-[11px] sm:text-xs font-bold text-red-500">Temporarily Out of Stock</span>
                        ) : activeVariation && activeVariation.stock !== undefined && Number(activeVariation.stock) < 5 ? (
                            <span className="text-[11px] sm:text-xs font-extrabold text-[#AC8717] animate-pulse uppercase tracking-wide">
                                Only {activeVariation.stock} left in stock - order soon!
                            </span>
                        ) : (
                            <span className="text-[11px] sm:text-xs font-bold text-green-600">In Stock and ready to ship</span>
                        )}
                    </div>

                    {/* Shipping details */}
                    <div className="text-[10px] sm:text-[11px] text-muted-foreground space-y-1 border-t border-b border-border/40 py-2 my-0.5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-green-600 font-extrabold">✓ FREE Delivery</span>
                            <span>on orders over ৳ 2,000</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground">🛡️ Secure Transaction</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span>💵 Cash on Delivery available</span>
                        </div>
                    </div>

                    {/* Qty & Checkout Buttons */}
                    <div className="space-y-2.5 md:space-y-3">
                        {!isOutOfStock && (
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Quantity:</span>
                                <div className="flex items-center border border-border rounded-full h-8 px-2.5 bg-background shadow-xs">
                                    <button
                                        onClick={() => setQty(Math.max(1, qty - 1))}
                                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                        disabled={isOutOfStock}
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-foreground font-black px-3.5 text-xs">{qty}</span>
                                    <button
                                        onClick={() => setQty(activeVariation && activeVariation.stock !== undefined ? Math.min(Number(activeVariation.stock), qty + 1) : qty + 1)}
                                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                        disabled={isOutOfStock}
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className={cn(
                                    "w-full h-10 text-black font-extrabold uppercase tracking-widest rounded-full transition-all duration-300 hover:scale-[1.01] shadow-xs text-[10px]",
                                    isOutOfStock 
                                        ? "bg-muted text-muted-foreground border border-border cursor-not-allowed" 
                                        : "bg-[#AC8717] hover:bg-[#967412] text-white border border-[#AC8717]/10"
                                )}
                            >
                                <ShoppingBag className="w-3.5 h-3.5 mr-2" />
                                {isOutOfStock ? "Out of Stock" : isAlreadyInCart ? "In Your Cart" : "Add to Cart"}
                            </Button>

                            {!isOutOfStock && (
                                <Button
                                    onClick={handleBuyNow}
                                    className="w-full h-10 bg-[#AC8717] hover:bg-[#967412] text-white font-extrabold uppercase tracking-widest rounded-full transition-all duration-300 hover:scale-[1.01] shadow-xs text-[10px]"
                                >
                                    ⚡ Buy Now
                                </Button>
                            )}
                        </div>

                        {/* List addition & Shipping attribution */}
                        <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-[10px]">
                            <button
                                onClick={() => toggleWishlist(product._id)}
                                className={cn(
                                    "flex items-center gap-1 transition-colors font-bold uppercase tracking-wider",
                                    isWishlisted ? "text-[#AC8717]" : "text-muted-foreground hover:text-[#AC8717]"
                                )}
                            >
                                <Heart className={cn("w-3.5 h-3.5", isWishlisted && "fill-[#AC8717]")} />
                                <span>{isWishlisted ? "Remove from List" : "Add to Wish List"}</span>
                            </button>

                            <span className="text-muted-foreground font-semibold">Ships from <span className="text-foreground">Salaf</span></span>
                        </div>
                    </div>
                </div>

                {/* Specifications Table */}
                {product.attributes && product.attributes.length > 0 && (
                    <div className="border-t border-border/40 pt-4 mt-2">
                        <h3 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Product Specifications</h3>
                        <div className="bg-muted/10 rounded-xl border border-border/40 overflow-hidden">
                            <table className="w-full text-xs text-left">
                                <tbody>
                                    {product.attributes.map((attr: any, idx: number) => (
                                        <tr key={idx} className={cn("border-b border-border/30 last:border-0", idx % 2 === 0 ? "bg-muted/5" : "bg-transparent")}>
                                            <td className="px-3 py-2 font-semibold text-muted-foreground w-1/3 border-r border-border/30">{attr.key}</td>
                                            <td className="px-3 py-2 text-foreground font-medium">{attr.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>


        </section>
    );
}
