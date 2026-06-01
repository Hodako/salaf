import React from "react";

export default function ProductLoading() {
  return (
    <div className="bg-background min-h-screen text-foreground pt-4 md:pt-14 pb-8 animate-in fade-in duration-300">
      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb shimmer */}
        <div className="h-3 w-40 bg-muted/40 rounded-md animate-pulse mb-6" />

        <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-12">
          {/* Left: Product Gallery shimmer */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="w-full aspect-[4/5] sm:aspect-square bg-muted/20 border border-[#AC8717]/10 rounded-2xl animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#AC8717]/5 to-transparent -translate-x-full animate-shimmer" />
            </div>
            {/* Thumbnails shimmer */}
            <div className="flex gap-2.5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="w-14 h-14 bg-muted/30 border border-[#AC8717]/5 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Right: Product Info shimmer */}
          <div className="w-full md:w-1/2 flex flex-col space-y-4">
            <div className="h-3 w-28 bg-muted/50 rounded-md animate-pulse" />
            <div className="h-8 w-2/3 bg-muted/40 rounded-xl animate-pulse" />
            <div className="h-4 w-5/6 bg-muted/30 rounded-md animate-pulse font-light" />
            <div className="h-4 w-3/4 bg-muted/30 rounded-md animate-pulse font-light" />
            <div className="h-4 w-48 bg-muted/40 rounded-md animate-pulse" />

            <hr className="border-border/40 my-2" />

            {/* Variations shimmer */}
            <div className="space-y-2">
              <div className="h-3.5 w-32 bg-muted/40 rounded-md animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-8 w-20 bg-muted/20 border border-border rounded-xl animate-pulse" />
                ))}
              </div>
            </div>

            {/* Buy Box card shimmer */}
            <div className="border border-[#AC8717]/10 bg-white/30 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
              <div className="h-7 w-32 bg-muted/40 rounded-xl animate-pulse" />
              <div className="h-4 w-40 bg-muted/35 rounded-md animate-pulse" />
              <hr className="border-border/30" />
              <div className="space-y-2">
                <div className="h-8 w-full bg-muted/45 rounded-full animate-pulse" />
                <div className="h-8 w-full bg-muted/30 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
