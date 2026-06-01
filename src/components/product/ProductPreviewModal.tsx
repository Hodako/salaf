"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ClientProduct, IVariation } from "@/types";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { logAddToCart } from "@/lib/gtm";
import Link from "next/link";

interface ProductPreviewModalProps {
    product: ClientProduct;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Quick View Modal for product previews.
 */
export function ProductPreviewModal({ product, isOpen, onOpenChange }: ProductPreviewModalProps) {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [qty, setQty] = useState(1);
    const [activeImg, setActiveImg] = useState(product.featuredImage || (product.images && product.images[0]));

    // Consolidate unique images: Featured + Gallery
    const allGalleryImages = useMemo(() => {
        const set = new Set<string>();
        if (product.featuredImage) set.add(product.featuredImage);
        product.images?.forEach(img => set.add(img));
        return Array.from(set);
    }, [product.featuredImage, product.images]);

    // Update active image when variation with specific image is selected
    useEffect(() => {
        if (selectedIdx === null) return;
        const variationImage = product.variations[selectedIdx]?.image;
        if (variationImage) {
            setActiveImg(variationImage);
        }
    }, [selectedIdx, product.variations]);

    const activeVariation = selectedIdx !== null ? product.variations[selectedIdx] : null;
    const price = activeVariation?.salePrice || activeVariation?.basePrice || 0;

    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart, setIsCartOpen } = useCart();
    const isWishlisted = isInWishlist(product._id);

    const handleAddToCart = () => {
        if (selectedIdx === null || !activeVariation) return;

        logAddToCart(product, activeVariation, qty);
        addToCart({
            productId: product._id,
            productName: product.name,
            featuredImage: product.featuredImage || (product.images && product.images[0]),
            variationIdx: selectedIdx,
            volume: `${activeVariation.volume}${activeVariation.volumeUnit}`,
            price: price,
            quantity: qty,
            slug: product.slug,
            sku: activeVariation.sku,
            variantType: activeVariation.variantType
        });
        
        // Finalize: close modal and show results in sidebar
        onOpenChange(false);
        setTimeout(() => setIsCartOpen(true), 300);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl p-0 overflow-hidden border-none bg-background rounded-[1.5rem] md:rounded-[2rem] shadow-2xl z-[150]">
                <div className="flex flex-col md:flex-row w-full max-h-[85vh] md:max-h-[90vh] overflow-y-auto overflow-x-hidden">
                    {/* Left: Product Image & Gallery */}
                    <div className="w-full md:w-1/2 bg-black/5 p-4 sm:p-10 flex flex-col items-center justify-center relative min-h-[300px] sm:min-h-[450px] md:min-h-[550px]">
                        <div className="relative w-full aspect-square max-h-[300px] sm:max-h-[400px]">
                            <Image
                                src={activeImg}
                                alt={product.name}
                                fill
                                className="object-contain p-4 drop-shadow-lg"
                                priority
                            />
                        </div>
                        {/* Modal Thumbnails */}
                        {allGalleryImages.length > 1 && (
                            <div className="flex gap-2 sm:gap-3 overflow-x-auto mt-4 md:mt-6 pb-2 scrollbar-none justify-center w-full">
                                {allGalleryImages.map((img: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImg(img)}
                                        className={cn(
                                            "relative w-12 sm:w-16 md:w-20 aspect-square rounded-xl overflow-hidden bg-white border-2 transition-all shrink-0",
                                            activeImg === img ? "border-bprimary-dark ring-2 ring-bprimary-dark/10" : "border-transparent opacity-60 hover:opacity-100 shadow-sm"
                                        )}
                                    >
                                        <Image src={img} alt="" fill className="object-cover p-1 md:p-2" />
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

                    {/* Right: Product Info */}
                    <div className="w-full md:w-1/2 p-5 sm:p-8 md:p-12 flex flex-col justify-center">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <DialogTitle className="text-xl sm:text-3xl md:text-4xl font-heading font-medium text-foreground tracking-wide flex-1 leading-tight">
                                        {product.name}
                                    </DialogTitle>
                                    {product.brand && typeof product.brand !== 'string' && 'slug' in product.brand && (product.brand as any).logo && (
                                        <div className="shrink-0 bg-white border border-gray-100 rounded-lg p-1.5 shadow-sm">
                                            <div className="w-10 h-10 sm:w-14 sm:h-14 relative rounded-md overflow-hidden">
                                                <Image 
                                                    src={(product.brand as any).logo} 
                                                    alt={(product.brand as any).name} 
                                                    fill 
                                                    className="object-contain p-0.5"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-xs sm:text-sm font-light leading-relaxed max-w-md">
                                    {product.seoDescription || "A celebration of sophistication, crafted with the finest essences."}
                                </p>
                            </div>

                            {/* Variations Selector */}
                            <div className="space-y-3">
                                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Select Size</div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {product.variations.map((v: IVariation, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedIdx(i)}
                                            className={cn( "px-3 sm:px-4 py-2 sm:py-3 text-[9px] sm:text-xs font-bold uppercase tracking-widest rounded-xl border-2 transition-all", selectedIdx === i ? "border-bprimary-dark text-bprimary-dark bg-bprimary-dark/5 shadow-sm" : "border-border text-muted-foreground hover:border-bprimary-dark/30" )}
                                        >
                                            {v.volume}{v.volumeUnit} {v.variantType ? `(${v.variantType})` : ""}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-4">
                                {selectedIdx === null ? (
                                    <div className="text-xl sm:text-2xl font-medium text-bprimary-dark tracking-wide">
                                        ৳ {Math.min(...product.variations.map(v => v.salePrice || v.basePrice)).toLocaleString()} - ৳ {Math.max(...product.variations.map(v => v.salePrice || v.basePrice)).toLocaleString()}
                                    </div>
                                ) : activeVariation?.salePrice ? (
                                    <>
                                        <div className="text-xl sm:text-2xl font-medium text-bprimary-dark tracking-wide">
                                            ৳ {activeVariation.salePrice.toLocaleString()}
                                        </div>
                                        <div className="text-base sm:text-lg text-muted-foreground price-strike opacity-50">
                                            ৳ {activeVariation.basePrice.toLocaleString()}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-xl sm:text-2xl font-medium text-bprimary-dark tracking-wide">
                                        ৳ {activeVariation?.basePrice.toLocaleString()}
                                    </div>
                                )}
                            </div>

                            {/* Actions Row */}
                            <div className="pt-2 md:pt-4">
                                <div className="flex items-center gap-3">
                                    {/* Quantity Selector */}
                                    <div className="flex items-center justify-between border border-border rounded-full h-11 md:h-14 px-3 md:px-5 bg-white/50 backdrop-blur-sm shadow-sm min-w-[110px] md:min-w-[160px]">
                                        <button
                                            onClick={() => setQty(Math.max(1, qty - 1))}
                                            className="text-muted-foreground hover:text-foreground transition-colors p-1 md:p-2"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="text-foreground font-black w-6 md:w-10 text-center text-sm md:text-base">{qty}</span>
                                        <button
                                            onClick={() => setQty(qty + 1)}
                                            className="text-muted-foreground hover:text-foreground transition-colors p-1 md:p-2"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Add to Bag Button */}
                                    <Button
                                        onClick={handleAddToCart}
                                        disabled={selectedIdx === null}
                                        className="flex-1 h-11 md:h-14 bg-bprimary-dark hover:bg-bprimary-dark/90 disabled:bg-muted disabled:text-muted-foreground text-white font-black uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-full transition-all duration-500 hover:scale-[1.02] shadow-lg shadow-bprimary-dark/10 text-[9px] md:text-sm"
                                    >
                                        <ShoppingBag className="w-4 h-4 mr-2 hidden sm:block" />
                                        {selectedIdx === null ? "Select Size" : "Add to Bag"}
                                    </Button>

                                    {/* Wishlist Icon Button */}
                                    <button
                                        onClick={() => toggleWishlist(product._id)}
                                        className={cn(
                                            "flex items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-full border border-border transition-all",
                                            isWishlisted ? "bg-bprimary-dark/5 text-bprimary-dark border-bprimary-dark/20" : "bg-white/50 text-foreground hover:text-bprimary-dark"
                                        )}
                                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                                    >
                                        <Heart className={cn("w-5 h-5", isWishlisted && "fill-bprimary-dark")} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
