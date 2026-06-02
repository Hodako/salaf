import React from "react";

export default function ProductLoading() {
  return (
    <div className="bg-background min-h-screen text-foreground pt-2 md:pt-8 pb-8 animate-in fade-in duration-300">
      <div className="container mx-auto px-0 md:px-6">
        {/* Breadcrumb shimmer */}
        <div className="h-3.5 w-48 bg-muted/30 rounded-full animate-pulse mb-4 md:mb-6 mx-3 md:mx-0" />

        <div className="flex flex-col md:flex-row gap-2.5 md:gap-8 lg:gap-10 mb-8 md:mb-12">
          {/* Left: Product Gallery shimmer */}
          <div className="w-full md:w-1/2 flex flex-col gap-2 md:gap-4">
            <div className="w-full h-[380px] sm:h-[440px] md:h-[480px] bg-muted/20 border-y md:border border-[#AC8717]/10 md:rounded-2xl animate-pulse relative overflow-hidden">
               {/* Shimmer line */}
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#AC8717]/5 to-transparent -translate-x-full animate-shimmer" />
            </div>
            {/* Thumbnails shimmer */}
            <div className="flex gap-2 overflow-x-auto px-2 justify-start md:justify-center w-full">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="w-12 sm:w-16 aspect-square bg-muted/30 border border-[#AC8717]/5 rounded-lg sm:rounded-xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Right: Product Info shimmer */}
          <div className="w-full md:w-1/2 flex flex-col space-y-2.5 md:space-y-3 px-3 md:px-0">
            <div className="h-3 w-32 bg-muted/40 rounded-full animate-pulse mb-1" />
            <div className="h-8 md:h-10 w-3/4 bg-muted/30 rounded-xl animate-pulse" />
            <div className="h-4 w-full bg-muted/20 rounded-md animate-pulse max-w-lg" />
            <div className="h-4 w-2/3 bg-muted/20 rounded-md animate-pulse" />

            <div className="h-4 w-40 bg-muted/30 rounded-full animate-pulse mt-2" />

            <hr className="border-border/40 my-1" />

            {/* Variations shimmer */}
            <div className="space-y-2">
              <div className="h-3 w-28 bg-muted/40 rounded-full animate-pulse" />
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-8 w-24 bg-muted/20 border border-border/40 rounded-lg sm:rounded-xl animate-pulse" />
                ))}
              </div>
            </div>

            {/* Buy Box card shimmer */}
            <div className="border border-[#AC8717]/15 bg-white/40 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xs space-y-4 mt-2">
              <div className="h-9 w-32 bg-muted/40 rounded-xl animate-pulse" />
              <div className="h-4 w-48 bg-muted/20 rounded-full animate-pulse" />
              <hr className="border-border/20" />
              <div className="space-y-3">
                <div className="h-10 w-full bg-muted/40 rounded-full animate-pulse" />
                <div className="h-10 w-full bg-muted/30 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Story Skeleton */}
        <div className="h-[400px] bg-muted/10 rounded-3xl animate-pulse mt-12 mx-auto max-w-7xl" />
      </div>
    </div>
  );
}
