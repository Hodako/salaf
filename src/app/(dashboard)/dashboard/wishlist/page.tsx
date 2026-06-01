"use client";

import React from "react";
import { Heart, ShoppingBag, ArrowRight, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks";
import Image from "next/image";
import axios from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function WishlistPage() {
    const { user, loading } = useAuth();
    const queryClient = useQueryClient();

    const removeFromWishlist = useMutation({
        mutationFn: async (productId: string) => {
            await axios.post("/user/wishlist", { productId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth-me"] });
            toast.success("Removed from wishlist");
        }
    });

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-bprimary animate-spin" />
            </div>
        );
    }

    const wishlist = (user as any)?.wishlist || [];

    return (
        <div className="p-6 md:p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-4xl md:text-5xl font-heading font-medium text-white italic">
                    My <span className="text-bprimary">Wishlist</span>
                </h1>
                <p className="text-gray-500 mt-4 leading-relaxed">Your curated selection of future acquisitions.</p>
            </header>

            {wishlist.length === 0 ? (
                <div className="bg-white/5 border border-white/5 rounded-[3rem] p-16 text-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 rounded-full bg-bprimary/10 flex items-center justify-center mx-auto mb-8 border border-bprimary/20">
                        <Heart className="w-10 h-10 text-bprimary opacity-40" />
                    </div>
                    <h2 className="text-2xl text-white font-medium mb-4">Your collection is empty</h2>
                    <p className="text-gray-500 mb-10 leading-relaxed">Save the fragrances that speak to you, and we'll keep them ready for your next acquisition.</p>
                    <Link href="/shop">
                        <Button className="h-14 bg-white text-black font-bold uppercase tracking-widest rounded-2xl px-12 hover:bg-bprimary transition-colors group">
                            Discover Fragrances
                            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {wishlist.map((product: any) => (
                        <div key={product._id} className="group bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-white/8 transition-all duration-500">
                            <div className="aspect-square relative overflow-hidden">
                                <Image 
                                    src={product.featuredImage} 
                                    alt={product.name} 
                                    fill 
                                    className="object-cover group-hover:scale-110 transition-transform duration-700 p-4"
                                />
                                <div className="absolute top-6 right-6 flex flex-col gap-2">
                                    <button 
                                        onClick={() => removeFromWishlist.mutate(product._id)}
                                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 space-y-4">
                                <div>
                                    <h3 className="text-xl font-medium text-white group-hover:text-bprimary transition-colors truncate">{product.name}</h3>
                                    <p className="text-bprimary font-mono mt-1 font-bold">৳{product.variations?.[0]?.basePrice?.toLocaleString()}</p>
                                </div>
                                <Link href={`/product/${product.slug}`}>
                                    <Button className="w-full h-12 bg-white/5 text-white border border-white/10 font-bold uppercase tracking-widest rounded-xl text-[10px] hover:bg-bprimary hover:text-black transition-all group">
                                        View Details
                                        <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
