"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Award, ArrowRight, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrandItem {
    _id: any;
    name: string;
    slug: string;
    logo: string;
    description: string;
}

interface BrandsListClientProps {
    initialBrands: BrandItem[];
}

export default function BrandsListClient({ initialBrands }: BrandsListClientProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBrands = initialBrands.filter(brand =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-12">
            {/* Search Input Bar (Material-Inspired) */}
            <div className="max-w-md mx-auto relative group">
                <div className="absolute inset-0 bg-bprimary/10 rounded-full blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center bg-card border border-border/80 rounded-full px-5 py-3.5 shadow-sm hover:shadow-md focus-within:border-bprimary/85 transition-all duration-300">
                    <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search perfume houses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder-muted-foreground/60 font-light"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                            aria-label="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Brands Grid with Framer Motion Layout Animations */}
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredBrands.map((brand) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                            key={brand._id.toString()}
                        >
                            <Link 
                                href={`/brands/${brand.slug}`}
                                className="group relative bg-card/60 hover:bg-card border border-border/60 hover:border-bprimary/40 rounded-[2rem] p-6 flex flex-col items-center text-center transition-all duration-500 hover:shadow-[0_12px_40px_-12px_rgba(172,135,23,0.25)] hover:-translate-y-1 overflow-hidden h-full"
                            >
                                {/* Decorative surface light accent */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-bprimary/5 rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                {/* Circular Brand Logo container */}
                                <div className="relative w-28 h-28 rounded-full overflow-hidden bg-[#eeeae3] border border-border shadow-inner p-1 mb-5 transition-transform duration-500 group-hover:scale-105">
                                    <Image
                                        src={brand.logo || "/logo.png"}
                                        alt={`${brand.name} logo`}
                                        fill
                                        sizes="(max-width: 768px) 100px, 112px"
                                        className="object-cover rounded-full"
                                    />
                                </div>

                                <h2 className="font-heading font-bold text-lg text-foreground mb-3 group-hover:text-bprimary-dark transition-colors tracking-wide">
                                    {brand.name}
                                </h2>

                                <p className="text-xs text-muted-foreground font-light leading-relaxed mb-6 line-clamp-3 max-w-[240px]">
                                    {brand.description || `Discover the exclusive olfactory universe of ${brand.name}. Expert craftsmanship, premium ingredients, and exceptional longevity.`}
                                </p>

                                <div className="mt-auto flex items-center gap-1.5 text-bprimary-dark group-hover:text-bprimary font-black uppercase text-[10px] tracking-widest transition-all">
                                    <span>Explore Collection</span>
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Empty Search State */}
            {filteredBrands.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 bg-card/40 rounded-3xl border border-dashed border-border/80 max-w-md mx-auto p-8 shadow-xs flex flex-col items-center"
                >
                    <Award className="w-10 h-10 text-muted-foreground/30 mb-4" />
                    <h3 className="font-heading font-semibold text-base text-foreground mb-2">No Fragrance Houses Found</h3>
                    <p className="text-muted-foreground text-xs font-light max-w-xs leading-relaxed">
                        We couldn't find any brand matching "{searchQuery}". Try searching with different keywords.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
