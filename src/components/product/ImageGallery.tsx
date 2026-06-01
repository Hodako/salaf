"use client";

import { ImageGallerySectionData } from "@/types/models";
import Image from "next/image";

/**
 * A component that displays a collection of images in various layouts.
 * 
 * Supports 'grid', 'carousel', and 'masonry' layout styles. 
 * Images feature hover effects and are displayed with a consistent 
 * aspect ratio where appropriate.
 */
export function ImageGallery({ data }: { data: ImageGallerySectionData }) {
 if (!data.images || data.images.length === 0) return null;

 const renderGrid = () => (
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
 {data.images.map((img, idx) => (
 <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
 <Image
 src={img}
 alt={`Gallery Image ${idx + 1}`}
 fill
 className="object-cover transition-transform duration-700 group-hover:scale-110"
 />
 <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
 </div>
 ))}
 </div>
 );

 const renderCarousel = () => (
 <div className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory hide-scrollbars">
 {data.images.map((img, idx) => (
 <div key={idx} className="relative w-[85vw] md:w-[60vw] lg:w-[40vw] shrink-0 aspect-4/3 rounded-3xl overflow-hidden snap-center">
 <Image
 src={img}
 alt={`Carousel Image ${idx + 1}`}
 fill
 className="object-cover"
 />
 </div>
 ))}
 </div>
 );

 const renderMasonry = () => (
 <div className="columns-2 md:columns-3 gap-4 space-y-4">
 {data.images.map((img, idx) => (
 <div key={idx} className="relative rounded-2xl overflow-hidden group break-inside-avoid">
 {/* Next.js doesn't support fill for true masonry dynamic heights natively without knowing the sizes, 
 so we use standard img with styling for fluid masonry */}
 <img
 src={img}
 alt={`Masonry Image ${idx + 1}`}
 className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.03]"
 />
 </div>
 ))}
 </div>
 );

 return (
 <section className="w-full py-20 px-4 md:px-12 lg:px-24 bg-background">
 <div className="max-w-7xl mx-auto">
 {data.layoutStyle === 'carousel' ? renderCarousel() :
 data.layoutStyle === 'masonry' ? renderMasonry() :
 renderGrid()}
 </div>
 </section>
 );
}
