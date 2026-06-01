"use client";

import React, { useState, useMemo } from "react";
import { Star, MessageSquarePlus, Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReviewSectionProps } from "@/types";
import { ProductReviewForm } from "./ProductReviewForm";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ReviewSection({ productId, productName, reviews, stats }: ReviewSectionProps) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [galleryState, setGalleryState] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
  }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
  });

  const visibleReviews = useMemo(() => reviews.slice(0, Math.max(0, visibleCount)), [reviews, visibleCount]);
  const hasMoreToShow = visibleCount < reviews.length;

  // Calculate recommendation percentage (4 and 5 stars)
  const recommendationRate = useMemo(() => {
    if (stats.totalReviews === 0) return 0;
    const highRatings = stats.starDistribution
      .filter((d) => d.star >= 4)
      .reduce((acc, d) => acc + d.count, 0);
    return Math.round((highRatings / stats.totalReviews) * 100);
  }, [stats]);

  const onLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 5, reviews.length));
  };

  const formatWithOrdinal = (dateInput: string | number | Date) => {
    const d = new Date(dateInput);
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    const suffix = ([11, 12, 13].includes(day % 100))
      ? "th"
      : (["th", "st", "nd", "rd"][Math.min(day % 10, 4)] || "th");
    return `${day}${suffix} ${month} ${year}`;
  };

  const getExternalPlatformLabel = (source?: string) => {
    if (!source) return "External";
    const map: Record<string, string> = {
      FACEBOOK: "Facebook",
      GOOGLE: "Google",
      INSTAGRAM: "Instagram",
      OTHERS: "External"
    };
    return map[source] || "External";
  };

  const openGallery = (images: string[], index: number) => {
    setGalleryState({ isOpen: true, images, currentIndex: index });
  };

  const closeGallery = () => {
    setGalleryState((prev) => ({ ...prev, isOpen: false }));
  };

  const nextImage = () => {
    setGalleryState((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
    }));
  };

  const prevImage = () => {
    setGalleryState((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
    }));
  };

  return (
    <section id="reviews-section" className="py-12 md:py-24 border-t border-border bg-background">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8 md:mb-16">
          <h2 className="text-4xl font-heading font-medium text-foreground relative inline-block">
            Reviews
            <div className="absolute -bottom-2 left-0 w-12 h-1 bg-bprimary rounded-full" />
          </h2>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-12 md:mb-24 bg-muted/20 rounded-3xl md:rounded-[2.5rem] p-6 md:p-16 border border-border/50 shadow-sm">
          {/* Left: Star Distribution */}
          <div className="space-y-2.5 md:space-y-4">
            {[5, 4, 3, 2, 1].map((star) => {
              const data = stats.starDistribution.find((d) => d.star === star) || { percentage: 0 };
              return (
                <div key={star} className="flex items-center gap-4 group">
                  <span className="text-sm font-medium text-muted-foreground w-12 whitespace-nowrap">
                    {star} stars
                  </span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-bprimary transition-all duration-1000 group-hover:bg-bprimary-dark"
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground w-12 text-right">
                    {Math.round(data.percentage)}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right: Average & CTA */}
          <div className="flex flex-col items-center md:items-start justify-center space-y-4 md:space-y-6 text-center md:text-left border-l-0 md:border-l border-border/50 md:pl-16">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      "w-5 h-5 md:w-6 md:h-6",
                      s <= Math.round(stats.avgRating)
                        ? "fill-bprimary text-bprimary"
                        : "text-muted/30"
                    )}
                  />
                ))}
              </div>
              <div className="text-4xl md:text-5xl font-heading font-medium text-foreground leading-none">
                {stats.avgRating.toFixed(1)} <span className="text-xl md:text-2xl text-muted-foreground font-light">out of 5</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground text-sm font-medium">
                {recommendationRate}% of reviewers recommend this product
              </p>

              <div className="flex flex-wrap items-center gap-6">
                <span className="text-sm text-foreground/80 font-bold tracking-tight">
                  {stats.totalReviews} reviews
                </span>

                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 text-bprimary-dark hover:text-bprimary font-black uppercase text-[11px] tracking-widest transition-colors group">
                      <MessageSquarePlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Add a Review
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] p-0 overflow-y-auto max-h-[95vh] rounded-[2rem] md:rounded-[2.5rem] bg-background border-border shadow-2xl z-150">
                    <DialogHeader className="hidden">
                      <DialogTitle>Add a Review</DialogTitle>
                    </DialogHeader>
                    <ProductReviewForm
                      productId={productId}
                      productName={productName}
                      onSuccess={() => {
                        setIsFormOpen(false);
                        router.refresh();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Review List */}
        <div className="space-y-12">
          {visibleReviews.map((review: any, i: number) => (
            <div key={i} className="flex flex-col md:flex-row gap-8 group animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${i * 100}ms` }}>
              {/* Avatar Column */}
              <div className="shrink-0 flex md:block items-center gap-4">
                <Avatar className="w-16 h-16 rounded-2xl border border-border shadow-sm group-hover:scale-105 transition-transform duration-500">
                  <AvatarImage src={review.userImage} />
                  <AvatarFallback className="bg-muted text-bprimary-dark font-black text-xl italic uppercase">
                    {review.user?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="md:hidden">
                  <h4 className="font-bold text-foreground text-lg">{review.user || "Anonymous User"}</h4>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-black">
                    {review.type === 'external'
                      ? `Posted on ${getExternalPlatformLabel(review.source)} on ${formatWithOrdinal(review.createdAt)}`
                      : formatWithOrdinal(review.createdAt)
                    }
                  </span>
                </div>
              </div>

              {/* Content Column */}
              <div className="flex-1 space-y-5">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "w-4 h-4",
                        s <= review.rating ? "fill-bprimary text-bprimary" : "text-muted/20"
                      )}
                    />
                  ))}
                </div>

                <p className="text-muted-foreground text-base leading-relaxed font-light">
                  {review.comment}
                </p>

                {review.images && review.images.length > 0 && (
                  <div className="flex gap-3 flex-wrap pt-2">
                    {review.images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => openGallery(review.images, idx)}
                        className="relative w-24 aspect-square rounded-2xl overflow-hidden border border-border group/img hover:border-bprimary/50 transition-all duration-300 shadow-sm"
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center">
                          <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="hidden md:flex items-center gap-4 pt-1">
                  <h4 className="font-bold text-foreground text-base">{review.user || "Anonymous User"}</h4>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                    {review.type === 'external'
                      ? `Posted on ${getExternalPlatformLabel(review.source)} on ${formatWithOrdinal(review.createdAt)}`
                      : formatWithOrdinal(review.createdAt)
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="text-center py-20 bg-muted/10 rounded-[2.5rem] border border-dashed border-border">
              <Star className="w-12 h-12 text-muted/30 mx-auto mb-6" />
              <p className="text-muted-foreground font-medium italic">No reviews yet. Be the first to share your journey.</p>
            </div>
          )}

          {/* Load More / See All */}
          {reviews.length > 0 && (
            <div className="flex items-center justify-center pt-4">
              {hasMoreToShow ? (
                <button
                  onClick={onLoadMore}
                  className="px-8 py-3 rounded-2xl border-2 border-border text-[11px] font-black uppercase tracking-widest hover:border-bprimary-dark hover:text-bprimary-dark transition-colors"
                >
                  See more reviews
                </button>
              ) : (
                <a
                  href="/reviews"
                  className="px-8 py-3 rounded-2xl border-2 border-border text-[11px] font-black uppercase tracking-widest hover:border-bprimary-dark hover:text-bprimary-dark transition-colors"
                >
                  See all reviews
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery Modal */}
      {galleryState.isOpen && (
        <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
          <button
            onClick={closeGallery}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-110"
          >
            <X className="w-10 h-10" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            {galleryState.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all z-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all z-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="w-full h-full flex items-center justify-center animate-in zoom-in-95 duration-500">
              <img
                src={galleryState.images[galleryState.currentIndex]}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
              {galleryState.images.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    idx === galleryState.currentIndex ? "bg-bprimary w-8" : "bg-white/20"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
