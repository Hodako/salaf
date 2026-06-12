"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { logViewCart } from "@/lib/gtm";

export default function CartPage() {
    const {
        cart,
        removeFromCart,
        updateQuantity,
        totalPrice,
        totalItems
    } = useCart();

    // Log GTM view_cart event when the page loads
    useEffect(() => {
        if (cart.length > 0) {
            logViewCart(cart, totalPrice);
        }
    }, [cart, totalPrice]);

    const breadcrumbs = [
        { name: "Home", url: "/" },
        { name: "Shopping Bag", url: "/cart" }
    ];

    return (
        <main className="min-h-screen bg-background text-foreground pt-4 md:pt-24 pb-16 overflow-x-hidden">
            <div className="container mx-auto px-4 md:px-6">
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="mb-6 md:mb-10">
                    <ol className="flex items-center flex-wrap gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                        {breadcrumbs.map((crumb, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                                {idx > 0 && <span aria-hidden="true">/</span>}
                                {idx === breadcrumbs.length - 1 ? (
                                    <span className="text-muted-foreground" aria-current="page">
                                        {crumb.name}
                                    </span>
                                ) : (
                                    <Link href={crumb.url} className="hover:text-foreground transition-colors">
                                        {crumb.name}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>

                <h1 className="text-2xl md:text-4xl font-heading font-medium tracking-wide text-foreground mb-8 uppercase flex items-center gap-3">
                    Your Bag <span className="text-bprimary-dark text-sm font-light">({totalItems} items)</span>
                </h1>

                {cart.length === 0 ? (
                    <div className="text-center py-20 bg-card/60 rounded-[2rem] border border-border/60 max-w-lg mx-auto p-8 shadow-sm flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-[#eeeae3] border border-border flex items-center justify-center mb-6">
                            <ShoppingBag className="w-10 h-10 text-muted-foreground/60" />
                        </div>
                        <h2 className="font-heading font-semibold text-lg text-foreground mb-2">Your Bag is Empty</h2>
                        <p className="text-muted-foreground text-xs font-light mb-8 max-w-xs leading-relaxed">
                            Discover our curated collections of premium fragrances, rare ouds, and exquisite florals.
                        </p>
                        <Link href="/shop" className="w-full max-w-xs">
                            <Button className="w-full h-12 bg-bprimary-dark text-white font-black uppercase tracking-[0.2em] rounded-full hover:scale-[1.02] transition-transform shadow-md">
                                Start Shopping
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-card/50 rounded-[2rem] border border-border/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                                <div className="divide-y divide-border/60">
                                    {cart.map((item) => (
                                        <div 
                                            key={`${item.productId}-${item.variationIdx}`} 
                                            className="p-6 md:p-8 flex gap-4 md:gap-6 items-center flex-wrap sm:flex-nowrap group hover:bg-card/20 transition-colors"
                                        >
                                            {/* Product Image */}
                                            <Link
                                                href={`/product/${item.slug}`}
                                                className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-[#eeeae3] border border-border/80 shrink-0 shadow-inner group/img"
                                            >
                                                <Image
                                                    src={item.featuredImage}
                                                    alt={item.productName}
                                                    fill
                                                    sizes="112px"
                                                    className="object-cover group-hover/img:scale-105 transition-transform duration-500"
                                                />
                                            </Link>

                                            {/* Item Details */}
                                            <div className="flex-1 min-w-0 flex flex-col py-1 self-stretch justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start gap-4">
                                                        <Link
                                                            href={`/product/${item.slug}`}
                                                            className="text-base md:text-lg text-foreground font-heading font-bold hover:text-bprimary-dark transition-colors line-clamp-1"
                                                        >
                                                            {item.productName}
                                                        </Link>
                                                        <button
                                                            onClick={() => removeFromCart(item.productId, item.variationIdx)}
                                                            className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                                                            aria-label="Remove item"
                                                        >
                                                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                                                        Volume: {item.volume}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between mt-4 sm:mt-0 pt-2 border-t border-border/40 sm:border-t-0">
                                                    {/* Quantity Controller */}
                                                    <div className="flex items-center border border-border/80 rounded-full px-3 py-1 bg-muted/50 shadow-inner">
                                                        <button
                                                            onClick={() => updateQuantity(item.productId, item.variationIdx, -1)}
                                                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <span className="text-foreground text-sm font-medium w-10 text-center select-none">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.productId, item.variationIdx, 1)}
                                                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Price */}
                                                    <span className="text-[#AC8717] font-heading font-semibold text-base md:text-lg">
                                                        ৳ {(item.price * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Side Column */}
                        <div className="space-y-6">
                            <div className="bg-card hover:bg-card border border-border/80 rounded-[2rem] p-6 md:p-8 shadow-[0_12px_40px_-12px_rgba(172,135,23,0.1)] space-y-6">
                                <h3 className="text-lg font-heading font-bold tracking-wider text-foreground uppercase pb-4 border-b border-border/60">
                                    Order Summary
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Subtotal ({totalItems} items)</span>
                                        <span>৳ {totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Shipping</span>
                                        <span className="text-xs italic text-muted-foreground/60">Calculated at checkout</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-heading font-semibold text-foreground pt-4 border-t border-border/60">
                                        <span>Estimated Total</span>
                                        <span className="text-[#AC8717]">৳ {totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Link href="/checkout" className="block w-full pt-2">
                                    <Button className="w-full h-14 bg-bprimary-dark text-white font-black uppercase tracking-[0.2em] rounded-full hover:scale-[1.02] transition-transform duration-300 group shadow-lg shadow-primary/10">
                                        Proceed to Checkout
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust Seals */}
                            <div className="bg-card/30 rounded-[2rem] border border-border/60 p-6 space-y-4">
                                <div className="flex items-center gap-3.5 text-foreground">
                                    <ShieldCheck className="w-5 h-5 text-bprimary-dark" />
                                    <div className="text-xs">
                                        <p className="font-bold">100% Secure Checkout</p>
                                        <p className="text-muted-foreground font-light mt-0.5">SSL Encrypted payments & reliable Cash on Delivery.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 text-foreground">
                                    <Truck className="w-5 h-5 text-bprimary-dark" />
                                    <div className="text-xs">
                                        <p className="font-bold">Fast Delivery Nationwide</p>
                                        <p className="text-muted-foreground font-light mt-0.5">Carefully packed & shipped via premium couriers.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 text-foreground">
                                    <RotateCcw className="w-5 h-5 text-bprimary-dark" />
                                    <div className="text-xs">
                                        <p className="font-bold">Easy Returns & Exchanges</p>
                                        <p className="text-muted-foreground font-light mt-0.5">Hassle-free support for any product quality issues.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
