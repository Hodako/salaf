"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth, useCart } from "@/hooks";
import { logViewCart } from "@/lib/gtm";
import { useEffect } from "react";

/**
 * A slide-out sidebar component for managing the shopping cart.
 * 
 * Displays the list of added items, allows for quantity adjustments and 
 * item removal, and provides a checkout trigger. Integrates with Redux 
 * for cart state and GTM for `view_cart` event logging.
 */
export function CartSidebar() {
    const { isAuthenticated } = useAuth();
    const {
        cart,
        isCartOpen,
        setIsCartOpen,
        removeFromCart,
        updateQuantity,
        totalPrice,
        totalItems
    } = useCart();

    useEffect(() => {
        if (isCartOpen && cart.length > 0) {
            logViewCart(cart, totalPrice);
        }
    }, [isCartOpen, cart, totalPrice]);

    return (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetContent side="right" className="w-full sm:max-w-md bg-card border-border p-0 flex flex-col shadow-2xl">
                <SheetHeader className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-2xl font-heading font-medium text-foreground flex items-center gap-3">
                            Your Bag <span className="text-bprimary-dark text-sm font-light">({totalItems} items)</span>
                        </SheetTitle>
                    </div>
                    <SheetDescription className="sr-only">
                        Review your items before checkout.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-border">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-foreground text-lg font-medium">Your bag is empty</p>
                                <p className="text-muted-foreground text-sm">Discover our collection of premium fragrances.</p>
                            </div>
                            <Button
                                onClick={() => setIsCartOpen(false)}
                                variant="outline"
                                className="border-bprimary/30 text-bprimary hover:bg-bprimary/10 rounded-full px-8"
                            >
                                Start Shopping
                            </Button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={`${item.productId}-${item.variationIdx}`} className="group flex gap-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                <Link
                                    href={`/product/${item.slug}`}
                                    onClick={() => setIsCartOpen(false)}
                                    className="relative w-24 aspect-square rounded-2xl overflow-hidden bg-muted border border-border shrink-0"
                                >
                                    <Image
                                        src={item.featuredImage}
                                        alt={item.productName}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </Link>

                                <div className="flex-1 flex flex-col py-1">
                                    <div className="flex justify-between items-start">
                                        <Link
                                            href={`/product/${item.slug}`}
                                            onClick={() => setIsCartOpen(false)}
                                            className="text-foreground font-medium hover:text-bprimary-dark transition-colors line-clamp-1"
                                        >
                                            {item.productName}
                                        </Link>
                                        <button
                                            onClick={() => removeFromCart(item.productId, item.variationIdx)}
                                            className="text-gray-600 hover:text-red-400 transition-colors p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mt-1">
                                        {item.volume}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4">
                                        <div className="flex items-center border border-border rounded-full px-3 py-1 bg-muted">
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.variationIdx, -1)}
                                                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-foreground text-xs font-medium w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.variationIdx, 1)}
                                                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <span className="text-bprimary-dark font-medium">৳ {(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-8 border-t border-border space-y-6 bg-linear-to-b from-transparent to-muted/20">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Subtotal</span>
                                <span>৳ {totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-medium text-foreground pt-2 border-t border-border">
                                <span>Total</span>
                                <span className="text-bprimary-dark">৳ {totalPrice.toLocaleString()}</span>
                            </div>
                        </div>

                        <Link
                            href="/checkout"
                            className="block w-full"
                            onClick={() => setIsCartOpen(false)}
                        >
                            <Button className="w-full h-14 bg-bprimary-dark text-white font-black uppercase tracking-[0.2em] rounded-full hover:scale-[1.02] transition-transform duration-500 group shadow-lg shadow-primary/10">
                                Checkout
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
