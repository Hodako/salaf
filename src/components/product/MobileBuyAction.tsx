"use client";

import React from "react";
import Image from "next/image";
import { ShoppingBag, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBuyActionProps {
    isVisible: boolean;
    activeImg: string;
    productName: string;
    volume: string;
    price: number;
    isOutOfStock: boolean;
    isAlreadyInCart: boolean;
    onAddToCart: () => void;
    onBuyNow: () => void;
}

/**
 * Sticky Bottom Buy/Cart Mobile Overlay.
 * Extracted into a separate component for lazy-loading.
 */
export default function MobileBuyAction({
    isVisible,
    activeImg,
    productName,
    volume,
    price,
    isOutOfStock,
    isAlreadyInCart,
    onAddToCart,
    onBuyNow
}: MobileBuyActionProps) {
    return (
        <div className={cn(
            "lg:hidden fixed bottom-0 left-0 right-0 z-[90] gold-gradient gold-bevel text-gray-950 px-4 transition-all duration-500 ease-in-out transform shadow-[0_-8px_30px_rgba(172,135,23,0.45)]",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}
        style={{
            paddingTop: "8px",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)"
        }}
        >
            <div className="flex items-center justify-between gap-3 w-full">
                {/* Product Thumbnail & Metadata Info */}
                <div className="flex items-center gap-2.5 max-w-[50%] shrink-0">
                    <div className="w-9 h-9 relative bg-white rounded-lg overflow-hidden border border-black/10 shrink-0 shadow-sm">
                        <Image
                            src={activeImg}
                            alt=""
                            fill
                            className="object-cover scale-[1.35]"
                        />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black text-gray-950 leading-none truncate uppercase font-heading tracking-wide">
                            {productName}
                        </span>
                        <div className="flex items-center gap-2 mt-1 leading-none text-gray-800">
                            <span className="text-[8px] font-extrabold uppercase tracking-widest shrink-0 bg-black/5 px-1.5 py-0.5 rounded-sm border border-black/5">
                                {volume}
                            </span>
                            <span className="text-gray-800/40 text-[9px] shrink-0">|</span>
                            <span className="text-[12px] font-black text-gray-950 shrink-0">
                                ৳ {price.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions: Add to Cart & Buy Now */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                    <button
                        onClick={onAddToCart}
                        disabled={isOutOfStock}
                        className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer shadow-md bg-black/10 border-t border-t-white/40 border-b border-b-black/30 border-x border-x-black/15 text-gray-950 hover:bg-black/15 active:scale-95",
                            isOutOfStock && "opacity-50 cursor-not-allowed",
                            isAlreadyInCart && "bg-green-700/20 border-green-600/30 text-green-800"
                        )}
                        title="Add to Cart"
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                    </button>

                    {!isOutOfStock && (
                        <button
                            onClick={onBuyNow}
                            className="h-9 px-4 bg-black/10 hover:bg-black/15 active:scale-[0.98] text-gray-950 font-black text-[9px] uppercase tracking-widest rounded-full transition-all duration-300 flex-1 max-w-[120px] flex items-center justify-center cursor-pointer shadow-md border-t border-t-white/40 border-b border-b-black/30 border-x border-x-black/15 gap-1.5"
                        >
                            <CreditCard className="w-3.5 h-3.5 shrink-0" />
                            <span>Buy</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
