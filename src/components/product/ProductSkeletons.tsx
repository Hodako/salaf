import React from 'react';

/**
 * Shimmer element utility using Next.js / Tailwind standard pulse classes.
 */
const Shimmer = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-muted-foreground/10 rounded-2xl ${className}`} />
);

/**
 * Luxury Skeletons for progressive loading (RSC Streaming)
 */

export function ReviewsSkeleton() {
  return (
    <section className="py-12 md:py-24 border-t border-border bg-background">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        {/* Header Skeleton */}
        <div className="mb-8 md:mb-16">
          <div className="h-10 w-36 bg-muted-foreground/10 animate-pulse rounded-md relative">
            <div className="absolute -bottom-2 left-0 w-12 h-1 bg-[#AC8717]/40 rounded-full" />
          </div>
        </div>

        {/* Summary Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-12 md:mb-24 bg-muted-foreground/5 rounded-[2.5rem] p-6 md:p-16 border border-border/30">
          {/* Left: Star Distribution */}
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-4">
                <Shimmer className="h-4 w-12 rounded-lg" />
                <Shimmer className="h-3 flex-1 rounded-full" />
                <Shimmer className="h-4 w-10 rounded-lg" />
              </div>
            ))}
          </div>

          {/* Right: Average & CTA */}
          <div className="flex flex-col items-center md:items-start justify-center space-y-6 md:pl-16 md:border-l border-border/30">
            <div className="space-y-2 flex flex-col items-center md:items-start">
              {/* Stars */}
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="w-5 h-5 md:w-6 md:h-6 rounded bg-muted-foreground/10 animate-pulse" />
                ))}
              </div>
              {/* Score text */}
              <Shimmer className="h-10 w-44 rounded-xl" />
            </div>

            <div className="space-y-3 w-full flex flex-col items-center md:items-start">
              <Shimmer className="h-4 w-56" />
              <div className="flex items-center gap-6 w-full justify-center md:justify-start">
                <Shimmer className="h-4 w-20" />
                <Shimmer className="h-4 w-28" />
              </div>
            </div>
          </div>
        </div>

        {/* Review List Skeleton */}
        <div className="space-y-12">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex flex-col md:flex-row gap-8">
              {/* Avatar Column */}
              <div className="shrink-0 flex md:block items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-muted-foreground/10 animate-pulse border border-border/40 shadow-sm" />
                <div className="md:hidden space-y-2">
                  <Shimmer className="h-4 w-32" />
                  <Shimmer className="h-3 w-48" />
                </div>
              </div>

              {/* Content Column */}
              <div className="flex-1 space-y-4">
                {/* Rating stars */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="w-4 h-4 rounded bg-muted-foreground/10 animate-pulse" />
                  ))}
                </div>

                {/* Text lines */}
                <div className="space-y-2">
                  <Shimmer className="h-4 w-full" />
                  <Shimmer className="h-4 w-11/12" />
                  <Shimmer className="h-4 w-4/5" />
                </div>

                {/* Date & name */}
                <div className="hidden md:flex items-center gap-4 pt-1">
                  <Shimmer className="h-4 w-28" />
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/10 animate-pulse" />
                  <Shimmer className="h-3 w-36" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RelatedProductsSkeleton() {
  return (
    <section className="py-12 md:py-24 border-t border-border">
      <h2 className="text-3xl md:text-5xl font-heading font-medium text-center text-[#AC8717]/60 mb-10 md:mb-20 tracking-wide uppercase">
        Discover More
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8 justify-center">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="flex flex-col bg-white overflow-hidden rounded-[2rem] border border-black/5 shadow-sm w-full max-w-[320px] mx-auto shrink-0 relative p-0"
          >
            {/* Aspect Ratio Box Shimmer */}
            <div className="relative w-full aspect-[300/410] bg-muted-foreground/10 animate-pulse overflow-hidden rounded-t-[2rem]" />
            <div className="p-4 flex flex-col items-center justify-center gap-2">
              <Shimmer className="h-4 w-32" />
              <Shimmer className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
