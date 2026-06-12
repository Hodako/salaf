"use client";

import React, { useState, useMemo } from "react";
import { Star, MessageSquarePlus, Maximize2, X, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
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

  if (reviews.length === 0) {
    return (
      <section id="reviews-section" className="py-4 md:py-8 border-t border-border bg-background">
        <div className="container mx-auto max-w-5xl px-6 md:px-12">
          <div className="mb-3 md:mb-5">
            <h2 className="text-xl md:text-2xl font-heading font-medium text-foreground relative inline-block">
              Reviews
              <div className="absolute -bottom-1 left-0 w-8 h-1 bg-bprimary rounded-full" />
            </h2>
          </div>

          <div className="flex flex-col items-center justify-center p-6 md:p-10 bg-muted/20 rounded-xl border border-dashed border-border/50 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-bprimary/10 flex items-center justify-center text-[#AC8717]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-medium text-sm sm:text-base text-foreground">No reviews yet</h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground">Be the first to share your thoughts on this product!</p>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 bg-[#AC8717] hover:bg-[#967412] text-white px-6 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest transition-colors shadow-sm">
                  <MessageSquarePlus className="w-3.5 h-3.5" />
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
      </section>
    );
  }

  return (
    <section id="reviews-section" className="py-4 md:py-8 border-t border-border bg-background">
      <div className="container mx-auto max-w-5xl px-6 md:px-12">
        <div className="mb-3 md:mb-5">
          <h2 className="text-xl md:text-2xl font-heading font-medium text-foreground relative inline-block">
            Reviews
            <div className="absolute -bottom-1 left-0 w-8 h-1 bg-bprimary rounded-full" />
          </h2>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 mb-4 md:mb-6 bg-muted/20 rounded-xl p-4 md:p-6 border border-border/50 shadow-sm">
          {/* Left: Star Distribution */}
          <div className="space-y-1.5 md:space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const data = stats.starDistribution.find((d) => d.star === star) || { percentage: 0 };
              return (
                <div key={star} className="flex items-center gap-3 group">
                  <span className="text-xs font-medium text-muted-foreground w-12 whitespace-nowrap">
                    {star} stars
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-bprimary transition-all duration-1000 group-hover:bg-bprimary-dark"
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-foreground w-12 text-right">
                    {Math.round(data.percentage)}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right: Average & CTA */}
          <div className="flex flex-col items-center md:items-start justify-center space-y-2.5 md:space-y-3.5 text-center md:text-left border-l-0 md:border-l border-border/50 md:pl-8">
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-1 mb-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      "w-4 h-4 md:w-5 md:h-5",
                      s <= Math.round(stats.avgRating)
                        ? "fill-bprimary text-bprimary"
                        : "text-muted/30"
                    )}
                  />
                ))}
              </div>
              <div className="text-2xl md:text-3xl font-heading font-medium text-foreground leading-none">
                {stats.avgRating.toFixed(1)} <span className="text-sm md:text-base text-muted-foreground font-light">out of 5</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium">
                {recommendationRate}% of reviewers recommend this product
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <span className="text-xs text-foreground/80 font-bold tracking-tight">
                  {stats.totalReviews} reviews
                </span>

                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-1.5 text-bprimary-dark hover:text-bprimary font-black uppercase text-[10px] tracking-widest transition-colors group">
                      <MessageSquarePlus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
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
        <div className="space-y-6">
          {visibleReviews.map((review: any, i: number) => (
            <div key={i} className="flex flex-col md:flex-row gap-4 group animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${i * 100}ms` }}>
              {/* Avatar Column */}
              <div className="shrink-0 flex md:block items-center gap-3">
                <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-border shadow-sm group-hover:scale-105 transition-transform duration-500">
                  <AvatarImage src={review.userImage} />
                  <AvatarFallback className="bg-muted text-bprimary-dark font-black text-sm italic uppercase">
                    {review.user?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="md:hidden">
                  <h4 className="font-bold text-foreground text-sm">{review.user || "Anonymous User"}</h4>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                    {review.type === 'external'
                      ? `Posted on ${getExternalPlatformLabel(review.source)} on ${formatWithOrdinal(review.createdAt)}`
                      : formatWithOrdinal(review.createdAt)
                    }
                  </span>
                </div>
              </div>

              {/* Content Column */}
              <div className="flex-1 space-y-2 pl-14 md:pl-0">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "w-3.5 h-3.5",
                        s <= review.rating ? "fill-bprimary text-bprimary" : "text-muted/20"
                      )}
                    />
                  ))}
                </div>

                {review.comment ? (
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed font-light">
                    {review.comment}
                  </p>
                ) : (
                  <div className="flex items-center gap-1.5 text-muted-foreground/50 italic text-[11px] md:text-xs py-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Rating only (No comment text provided)</span>
                  </div>
                )}

                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap pt-1.5">
                    {review.images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => openGallery(review.images, idx)}
                        className="relative w-16 md:w-20 aspect-square rounded-xl overflow-hidden border border-border group/img hover:border-bprimary/50 transition-all duration-300 shadow-sm"
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center">
                          <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="hidden md:flex items-center gap-3 pt-1">
                  <h4 className="font-bold text-foreground text-sm">{review.user || "Anonymous User"}</h4>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
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
            <div className="text-center py-10 bg-muted/10 rounded-2xl border border-dashed border-border">
              <Star className="w-8 h-8 text-muted/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-xs font-medium italic">No reviews yet. Be the first to share your journey.</p>
            </div>
          )}

          {/* Load More / See All */}
          {reviews.length > 0 && (
            <div className="flex items-center justify-center pt-2">
              {hasMoreToShow ? (
                <button
                  onClick={onLoadMore}
                  className="px-5 py-2.5 rounded-xl border-2 border-border text-[10px] font-black uppercase tracking-widest hover:border-bprimary-dark hover:text-bprimary-dark transition-colors"
                >
                  See more reviews
                </button>
              ) : (
                <a
                  href="/reviews"
                  className="px-5 py-2.5 rounded-xl border-2 border-border text-[10px] font-black uppercase tracking-widest hover:border-bprimary-dark hover:text-bprimary-dark transition-colors"
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
