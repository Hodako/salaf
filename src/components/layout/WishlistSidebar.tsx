"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import {
 Sheet,
 SheetContent,
 SheetHeader,
 SheetTitle,
 SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";

export function WishlistSidebar() {
 const { 
 wishlistProducts, 
 isWishlistOpen, 
 setIsWishlistOpen, 
 removeFromWishlist,
 isLoading 
 } = useWishlist();
 
 const { addToCart } = useCart();

 const handleMoveToBag = (product: any) => {
 // By default, add the first variation to bag
 const variation = product.variations[0];
 addToCart({
 productId: product._id,
 productName: product.name,
 featuredImage: product.featuredImage,
 variationIdx: 0,
 volume: `${variation.volume}${variation.volumeUnit}`,
 price: variation.salePrice || variation.basePrice,
 quantity: 1,
 slug: product.slug,
 sku: variation.sku
 });
 removeFromWishlist(product._id);
 };

 return (
 <Sheet open={isWishlistOpen} onOpenChange={setIsWishlistOpen}>
 <SheetContent side="right" className="w-full sm:max-w-md bg-card border-border p-0 flex flex-col shadow-2xl">
 <SheetHeader className="p-6 border-b border-border">
 <div className="flex items-center justify-between">
 <SheetTitle className="text-2xl font-heading font-medium text-foreground flex items-center gap-3">
 Wishlist <span className="text-bprimary-dark text-sm font-light">({wishlistProducts.length} items)</span>
 </SheetTitle>
 </div>
 <SheetDescription className="sr-only">
 Your saved items for later.
 </SheetDescription>
 </SheetHeader>

 <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-border">
 {isLoading ? (
 <div className="h-full flex items-center justify-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bprimary"></div>
 </div>
 ) : wishlistProducts.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
 <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
 <Heart className="w-10 h-10 text-gray-600" />
 </div>
 <div className="space-y-2">
 <p className="text-foreground text-lg font-medium">Your wishlist is empty</p>
 <p className="text-muted-foreground text-sm">Save items you love for later.</p>
 </div>
 <Button 
 onClick={() => setIsWishlistOpen(false)}
 variant="outline" 
 className="border-bprimary/30 text-bprimary hover:bg-bprimary/10 rounded-full px-8"
 >
 Browse Products
 </Button>
 </div>
 ) : (
 wishlistProducts.map((product: any) => (
 <div key={product._id} className="group flex gap-5 animate-in fade-in slide-in-from-right-4 duration-500">
 <Link 
 href={`/product/${product.slug}`}
 onClick={() => setIsWishlistOpen(false)}
 className="relative w-24 aspect-square rounded-2xl overflow-hidden bg-muted border border-border shrink-0"
 >
 <Image
 src={product.featuredImage}
 alt={product.name}
 fill
 className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
 />
 </Link>

 <div className="flex-1 flex flex-col py-1">
 <div className="flex justify-between items-start">
 <Link 
 href={`/product/${product.slug}`}
 onClick={() => setIsWishlistOpen(false)}
 className="text-foreground font-medium hover:text-bprimary-dark transition-colors line-clamp-1"
 >
 {product.name}
 </Link>
 <button 
 onClick={() => removeFromWishlist(product._id)}
 className="text-gray-600 hover:text-red-400 transition-colors p-1"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 
 <p className="text-bprimary-dark font-medium mt-1">
 ৳ {(product.variations[0].salePrice || product.variations[0].basePrice).toLocaleString()}
 </p>

 <div className="mt-auto pt-4">
 <Button 
 onClick={() => handleMoveToBag(product)}
 className="w-full bg-foreground text-background hover:bg-bprimary-dark hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest h-9"
 >
 Move to Bag
 </Button>
 </div>
 </div>
 </div>
 ))
 )}
 </div>

 {wishlistProducts.length > 0 && (
 <div className="p-8 border-t border-border bg-linear-to-b from-transparent to-muted/20">
 <Button 
 onClick={() => {
 wishlistProducts.forEach(handleMoveToBag);
 setIsWishlistOpen(false);
 }}
 className="w-full h-14 bg-bprimary-dark text-white font-black uppercase tracking-[0.2em] rounded-full hover:scale-[1.02] transition-transform duration-500 shadow-lg shadow-primary/10"
 >
 Move All to Bag
 <ShoppingBag className="w-5 h-5 ml-2" />
 </Button>
 </div>
 )}
 </SheetContent>
 </Sheet>
 );
}
