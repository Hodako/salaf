"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Definitions for individual slide items within the storefront hero banner.
 */
interface HeroSlide {
  tagline: string;
  titleWhite: string;
  titleGold: string;
  description: string;
  imageUrl: string;
  mobileImageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
}

/**
 * Curated default slides featuring marquee assets and introductory shop navigation links.
 */
const DEFAULT_SLIDES: HeroSlide[] = [
  {
    tagline: "SALAF SCENTS",
    titleWhite: "PROVIDES THE BEST",
    titleGold: "CUSTOMER SERVICE",
    description: "EXPERIENCE SEAMLESS SUPPORT, FAST RESPONSE, AND CARE IN EVERY DETAIL FROM ORDER TO DELIVERY.",
    imageUrl: "/assets/hero_bag.png",
    mobileImageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000",
    buttonText: "SHOP NOW",
    buttonLink: "/shop",
  },
  {
    tagline: "EXCLUSIVE COLLECTION",
    titleWhite: "DISCOVER YOUR SIGNATURE",
    titleGold: "VICTORIOUS SCENT",
    description: "EXPERIENCE THE PURE ESSENCE OF LUXURY WITH HIGHLY CONCENTRATED, LONG-LASTING FRAGRANCE OILS.",
    imageUrl: "/assets/hero_perfume.png",
    buttonText: "BROWSE SHOP",
    buttonLink: "/shop",
  },
  {
    tagline: "CRAFTED WITH PASSION",
    titleWhite: "BACK TO PURE ORIGIN &",
    titleGold: "ROYAL TRADITION",
    description: "CURATED FROM NATURE'S MOST EXQUISITE TREASURES - RARE OUDS AND EXQUISITE FLORALS METICULOUSLY CRAFTED INTO MASTERPIECES.",
    imageUrl: "/assets/hero_oud.png",
    buttonText: "OUR STORY",
    buttonLink: "/about-us",
  }
];

/**
 * The landing page marquee component.
 * Displays a responsive, auto-cycling slideshow featuring key brand assets, value propositions,
 * and direct call-to-actions using hardware-accelerated transitions.
 */
interface HeroCarouselProps {
  preloadedData?: HeroSlide[];
}

export function HeroCarousel({ preloadedData }: HeroCarouselProps = {}) {
  const [slides, setSlides] = useState<HeroSlide[]>(preloadedData && preloadedData.length > 0 ? preloadedData : DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (preloadedData && preloadedData.length > 0) {
      setSlides(preloadedData);
      return;
    }
    fetch("/api/settings")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP error");
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.hero_slides) && data.hero_slides.length > 0) {
          setSlides(data.hero_slides);
        }
      })
      .catch((err) => console.log("Using default hero slides:", err));
  }, [preloadedData]);

  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300); // Wait for fade-out, then switch
  }, [currentIndex, isTransitioning]);

  const nextSlide = useCallback(() => {
    const nextIndex = (currentIndex + 1) % slides.length;
    goToSlide(nextIndex);
  }, [currentIndex, goToSlide, slides.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000); // Auto-advance every 6 seconds
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (slides.length === 0) return null;

  return (
    <section className="relative w-full h-[50vw] min-h-[168px] max-h-[230px] sm:max-h-none sm:min-h-[250px] md:min-h-[400px] lg:h-[650px] overflow-hidden bg-gradient-to-r from-[#0b0907] via-[#14110d] to-[#1c1812] flex items-center border-b border-white/5">
      {/* Carousel Slide Views */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={index}
            className={cn(
              "absolute inset-0 w-full h-full flex items-center transition-all duration-700 ease-in-out transform",
              isActive 
                ? "opacity-100 z-10 scale-100 pointer-events-auto" 
                : "opacity-0 z-0 scale-105 pointer-events-none"
            )}
          >
            <div className="container mx-auto px-0 sm:px-6 md:px-12 lg:px-16 flex flex-col lg:flex-row items-center justify-between h-full gap-0 sm:gap-6 lg:gap-8 py-0 sm:py-12 lg:py-0">
              
              {/* Narrative content and actions (Hidden on mobile for a clean Amazon-style promo image banner) */}
              <div className={cn(
                "hidden lg:flex flex-col items-start text-left max-w-2xl w-full lg:w-1/2 transition-all duration-1000 delay-300",
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}>
                {/* Logo and tagline marker */}
                <div className="flex items-center gap-2 mb-3 sm:mb-6 lg:mb-8">
                  <div className="relative w-6 h-6 sm:w-10 sm:h-10 opacity-80">
                    <Image src="/nav-logo.png" alt="Salaf Logo" fill className="object-contain mix-blend-screen brightness-150" />
                  </div>
                  <span className="text-white/60 text-[9px] sm:text-xs md:text-sm font-bold tracking-[0.25em] uppercase">
                    {slide.tagline}
                  </span>
                </div>

                {/* Main headings */}
                <h2 className="text-xs sm:text-lg md:text-2xl lg:text-3xl font-light text-white/90 tracking-[0.08em] leading-tight uppercase font-heading mb-1 drop-shadow-md">
                  {slide.titleWhite}
                </h2>
                <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-[#d4af37] tracking-[0.05em] uppercase leading-none mb-3 sm:mb-6 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] font-heading">
                  {slide.titleGold}
                </h1>

                {/* Secondary descriptions */}
                <p className="text-white/80 text-[10px] sm:text-sm md:text-base lg:text-lg font-light leading-relaxed tracking-[0.05em] max-w-md sm:max-w-xl mb-4 sm:mb-10 drop-shadow">
                  {slide.description}
                </p>

                {/* Action buttons */}
                {slide.buttonText && (
                  <Link
                    href={slide.buttonLink || "/"}
                    className="group flex items-center gap-2 px-5 py-2.5 sm:px-8 sm:py-4 bg-[#d4af37] hover:bg-white hover:text-[#0b0907] text-black rounded-full font-bold text-[10px] sm:text-xs md:text-sm tracking-[0.2em] uppercase transition-all shadow-[0_10px_25px_-10px_rgba(212,175,55,0.4)] hover:shadow-xl hover:-translate-y-0.5"
                  >
                    {slide.buttonText}
                  </Link>
                )}
              </div>

              {/* Hero visual imagery - Full bleed on mobile like Amazon promo banners */}
              <div className={cn(
                "relative w-full lg:w-1/2 h-full sm:h-[230px] md:h-[380px] lg:h-[500px] flex justify-center lg:justify-end items-center z-0 transition-all duration-1000 delay-500",
                isActive ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-95 rotate-2"
              )}>
                {/* Backdrop radial gradient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-[#d4af37]/10 rounded-full blur-[60px] sm:blur-[120px]" />
                
                {/* Mobile: full-bleed cover image (Amazon banner style) */}
                <div className="block sm:hidden absolute inset-0 w-full h-full">
                  <Image
                    src={slide.mobileImageUrl || slide.imageUrl}
                    alt={slide.titleGold}
                    fill
                    className="object-cover object-center"
                    sizes="100vw"
                    priority={index === 0}
                  />
                  {/* Phone banner intentionally stays image-only. */}
                </div>
                {/* Desktop / tablet image */}
                <div className="hidden sm:block relative w-full h-full max-w-sm lg:max-w-[500px] aspect-square overflow-hidden pointer-events-none drop-shadow-[0_35px_35px_rgba(0,0,0,0.6)]">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.titleGold}
                    fill
                    className="object-contain transition-all hover:scale-105 duration-[5000ms]"
                    sizes="(max-width: 1024px) 350px, 500px"
                    priority={index === 0}
                  />
                </div>
              </div>

            </div>
          </div>
        );
      })}

      {/* Framing gradients */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="absolute inset-y-0 left-0 w-1/3 pointer-events-none z-0 bg-gradient-to-r from-[#0b0907]/80 to-transparent" />

      {/* Navigation dots — visible on all sizes now */}
      <div className="absolute bottom-2 sm:bottom-8 right-2.5 sm:right-12 lg:right-16 z-20 flex items-center gap-1.5 sm:gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={cn(
              "h-1 sm:h-2 rounded-full transition-all duration-500 cursor-pointer",
              currentIndex === idx
                ? "w-4 sm:w-8 bg-[#d4af37]"
                : "w-1 sm:w-2 bg-white/50"
            )}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroCarousel;
