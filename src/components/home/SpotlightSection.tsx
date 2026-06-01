"use client";

import React, { useEffect, useState, useRef } from "react";
import { ProductCard } from "./ProductCard";
import { IProduct } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EnrichedSpotlightSection {
  title: string;
  subtitle: string;
  productIds: string[];
  products: IProduct[];
}

interface SpotlightRowProps {
  products: IProduct[];
}

function SpotlightRow({ products }: SpotlightRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="relative w-full group/row">
      {/* Left Navigation Arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-[#e2ddd1]/40 flex items-center justify-center text-foreground shadow-lg hover:bg-[#AC8717] hover:text-white transition-all cursor-pointer opacity-0 group-hover/row:opacity-100 hidden md:flex"
        aria-label="Scroll Left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right Navigation Arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-[#e2ddd1]/40 flex items-center justify-center text-foreground shadow-lg hover:bg-[#AC8717] hover:text-white transition-all cursor-pointer opacity-0 group-hover/row:opacity-100 hidden md:flex"
        aria-label="Scroll Right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Horizontal Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 md:gap-6 px-4 md:px-12 py-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
      >
        {products.map((product) => (
          <div
            key={product._id.toString()}
            className="w-[240px] sm:w-[260px] md:w-[280px] lg:w-[300px] shrink-0 snap-start"
          >
            <ProductCard product={product as any} config={{ showPrice: true, showVolume: true }} showReviews={false} />
          </div>
        ))}
      </div>
    </div>
  );
}

interface SpotlightSectionProps {
  preloadedData?: EnrichedSpotlightSection[];
}

export function SpotlightSection({ preloadedData }: SpotlightSectionProps = {}) {
  const [sections, setSections] = useState<EnrichedSpotlightSection[]>(preloadedData || []);
  const [loading, setLoading] = useState(!preloadedData || preloadedData.length === 0);

  useEffect(() => {
    if (preloadedData && preloadedData.length > 0) {
      setSections(preloadedData);
      setLoading(false);
      return;
    }
    fetch("/api/settings")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP error");
        return res.json();
      })
      .then(async (data) => {
        let sectionsList: any[] = [];
        if (data) {
          if (Array.isArray(data.spotlight_sections)) {
            sectionsList = data.spotlight_sections;
          } else if (data.spotlight_section) {
            sectionsList = [data.spotlight_section];
          }
        }

        if (sectionsList.length > 0) {
          const allProductIds = Array.from(
            new Set(sectionsList.flatMap((s) => s.productIds || []))
          ).filter(Boolean);

          if (allProductIds.length > 0) {
            const res = await fetch(`/api/products?ids=${allProductIds.join(",")}&limit=100`);
            if (!res.ok) throw new Error("Product fetch error");
            const resData = await res.json();
            
            const productMap = (resData?.products || []).reduce((acc: any, p: any) => {
              acc[p._id] = p;
              return acc;
            }, {});

            const enriched = sectionsList.map((sec) => ({
              title: sec.title || "Product Spotlight",
              subtitle: sec.subtitle || "",
              productIds: sec.productIds || [],
              products: (sec.productIds || [])
                .map((id: string) => productMap[id])
                .filter(Boolean),
            }));

            setSections(enriched);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error loading spotlight sections:", err);
        setLoading(false);
      });
  }, [preloadedData]);

  if (loading || sections.length === 0) return null;

  return (
    <div className="w-full space-y-12">
      {sections.map((section, secIdx) => {
        if (section.products.length === 0) return null;

        return (
          <section 
            key={secIdx} 
            className="w-full bg-[#fcfbf9] border-t border-b border-[#e2ddd1]/40 py-3.5 sm:py-16 px-0 sm:px-4"
          >
            <div className="w-full sm:container sm:mx-auto">
              
              {/* Heading */}
              <div className="flex flex-col items-center justify-center mb-3.5 sm:mb-10 text-center px-4">
                {section.subtitle && (
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-[#AC8717] mb-1">
                    {section.subtitle}
                  </p>
                )}
                <h2 className="text-sm sm:text-3xl font-heading font-semibold text-foreground tracking-wide uppercase border-b border-[#AC8717]/40 pb-1">
                  {section.title}
                </h2>
              </div>

              {/* Desktop Grid / Mobile Horizontal Scroll */}
              <div className="relative w-full">
                {/* Mobile: horizontal scrollable flex row */}
                <div className="flex sm:hidden overflow-x-auto gap-3 px-4 py-2 scrollbar-none snap-x snap-mandatory">
                  {section.products.map((product) => (
                    <div 
                      key={product._id.toString()} 
                      className="w-[125px] shrink-0 snap-start"
                    >
                      <ProductCard product={product as any} config={{ showPrice: true, showVolume: true }} showReviews={false} />
                    </div>
                  ))}
                </div>

                {/* Desktop/Tablet: horizontally slideable row with arrows */}
                <div className="hidden sm:block">
                  <SpotlightRow products={section.products} />
                </div>
              </div>

            </div>
          </section>
        );
      })}
    </div>
  );
}

export default SpotlightSection;
