'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ICollectionDocument } from '@/types/models.types';
import { motion } from 'framer-motion';

/**
 * A premium horizontal collections carousel with rectangular cards and rounded corners.
 * Each card is a portrait-ratio rectangle with a gradient overlay and gold label.
 * Supports auto-scroll on desktop, touch-scroll on mobile, and navigation arrows.
 */
interface Props {
  collections: ICollectionDocument[];
}

export default function CollectionsCarouselClient({ collections }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollX, setScrollX] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [windowWidth, setWindowWidth] = useState(375);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const isSetup = useRef(false);

  // Handle responsive client checks
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    if (scrollRef.current) {
      setContainerWidth(scrollRef.current.clientWidth);
    }

    const checkMobile = () => {
      const mobileVal = window.innerWidth < 768;
      setIsMobile(mobileVal);
      setWindowWidth(window.innerWidth);
      if (scrollRef.current) {
        setContainerWidth(scrollRef.current.clientWidth);
      }

      if (scrollRef.current && !isSetup.current) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'auto' });
        isSetup.current = true;
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = containerWidth * 0.45;
    scrollRef.current.scrollTo({
      left: scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount),
      behavior: 'smooth',
    });
  }, [containerWidth]);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    setScrollX(scrollLeft);
    setContainerWidth(clientWidth);
  }, []);

  const startAutoScroll = useCallback(() => {
    if (isMobile) return;
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    autoScrollRef.current = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scroll('right');
      }
    }, 4000);
  }, [scroll, isMobile]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
  }, []);

  useEffect(() => {
    if (!isMobile) startAutoScroll();
    else stopAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll, stopAutoScroll, isMobile]);

  if (!collections || collections.length === 0) return null;

  return (
    <div
      className="relative w-full group"
      onMouseEnter={isMobile ? undefined : stopAutoScroll}
      onMouseLeave={isMobile ? undefined : startAutoScroll}
    >
      <div className="container mx-auto px-0 sm:px-4 relative">

        {/* Left Arrow */}
        <div className="hidden md:flex absolute inset-y-0 left-0 z-20 items-center">
          <button
            onClick={() => scroll('left')}
            className={cn(
              'w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-xl border border-black/5 flex items-center justify-center text-black hover:bg-[#AC8717] hover:text-white transition-all transform hover:scale-110 active:scale-95',
              !canScrollLeft && 'opacity-0 pointer-events-none'
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Right Arrow */}
        <div className="hidden md:flex absolute inset-y-0 right-0 z-20 items-center">
          <button
            onClick={() => scroll('right')}
            className={cn(
              'w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-xl border border-black/5 flex items-center justify-center text-black hover:bg-[#AC8717] hover:text-white transition-all transform hover:scale-110 active:scale-95',
              !canScrollRight && 'opacity-0 pointer-events-none'
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 px-0 sm:px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {collections.map((collection, index) => {
            // Mobile Coverflow mathematical calculations based on screen dimensions and scroll position
            const cardWidth = isMobile ? (windowWidth * 0.28) : 144;
            const gap = isMobile ? 12 : 16;
            const paddingLeft = isMobile ? 16 : 8;

            const cardLeft = paddingLeft + index * (cardWidth + gap);
            const cardMid = cardLeft + cardWidth / 2;
            const viewportCenter = scrollX + (containerWidth || windowWidth) / 2;

            const distance = Math.abs(viewportCenter - cardMid);
            const maxDistance = (containerWidth || windowWidth) / 1.5;

            // Highly optimized scaling: center cards pop up to 1.08x, outer cards recede to 0.8x
            let scale = 1.08 - (distance / maxDistance) * 0.28;
            scale = Math.max(0.8, Math.min(1.08, scale));

            // Soft fading effect for receded cards
            let opacity = 1.0 - (distance / maxDistance) * 0.45;
            opacity = Math.max(0.65, Math.min(1.0, opacity));

            // Stack center cards on top of side cards (3D overlay depth)
            const zIndex = Math.round(100 - (distance / 5));

            // Subtle 3D Y-axis perspective rotation (coverflow book-stack style)
            let rotateY = 0;
            if (isMobile) {
              const relativeDistance = (viewportCenter - cardMid) / maxDistance;
              rotateY = -relativeDistance * 22; // rotate up to 22 degrees
              rotateY = Math.max(-25, Math.min(25, rotateY));
            }

            return (
              <Link
                key={`${collection.slug}-${index}`}
                href={`/collections/${collection.slug}`}
                className="shrink-0 snap-start group/card"
                style={isMobile ? { zIndex } : undefined}
              >
                <motion.div
                  style={isMobile ? { scale, opacity, rotateY, transformStyle: "preserve-3d", perspective: "1000px" } : undefined}
                  whileHover={isMobile ? undefined : { y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                  className={cn(
                    // Rectangle card: portrait ratio, rounded corners
                    'relative overflow-hidden rounded-2xl sm:rounded-3xl',
                    // Mobile: 3 visible + partial 4th ~ 28vw each; Desktop: fixed widths
                    'w-[28vw] h-[38vw] sm:w-36 sm:h-48 md:w-44 md:h-60 lg:w-52 lg:h-72',
                    // Border and shadow
                    'border border-[#e2ddd1] shadow-md',
                    'transition-shadow duration-500 group-hover/card:shadow-xl group-hover/card:border-[#AC8717]/40',
                    // Enforce max on mobile so it doesn't get too wide
                    'max-w-[130px] sm:max-w-none'
                  )}
                >
                {/* Background Image */}
                <Image
                  src={collection.imageUrl || '/placeholder-collection.jpg'}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
                  sizes="(max-width: 640px) 28vw, (max-width: 768px) 144px, (max-width: 1024px) 176px, 208px"
                />

                {/* Gradient Overlay — always visible at bottom for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-500 group-hover/card:from-black/85" />

                {/* Gold shimmer on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#AC8717]/0 via-[#AC8717]/0 to-[#AC8717]/0 group-hover/card:from-[#AC8717]/10 group-hover/card:via-[#AC8717]/5 group-hover/card:to-transparent transition-all duration-500 pointer-events-none" />



                {/* Label at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4">
                  {/* Gold accent line */}
                  <div className="w-5 sm:w-7 h-[1.5px] bg-[#AC8717] mb-1 sm:mb-1.5 transition-all duration-500 group-hover/card:w-10 sm:group-hover/card:w-14" />
                  <h3 className="text-white font-heading font-semibold text-[9px] sm:text-[11px] md:text-xs lg:text-sm uppercase tracking-widest leading-tight drop-shadow-sm line-clamp-2">
                    {collection.name}
                  </h3>
                  <p className="hidden sm:block text-white/50 text-[7px] sm:text-[8px] uppercase tracking-[0.18em] mt-0.5 group-hover/card:text-[#AC8717]/70 transition-colors">
                    Shop Now →
                  </p>
                </div>
              </motion.div>
            </Link>
          );
          })}
        </div>
      </div>
    </div>
  );
}
