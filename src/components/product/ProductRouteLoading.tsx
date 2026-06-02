"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type ProductPreview = {
    name: string;
    image: string;
    price: string;
    volume?: string;
    expiresAt: number;
};

const PREVIEW_KEY_PREFIX = "salaf:product-preview:";

function SkeletonBlock({ className }: { className: string }) {
    return <div className={`animate-pulse rounded-xl bg-muted/35 ${className}`} />;
}

export function ProductRouteLoading() {
    const pathname = usePathname();
    const slug = useMemo(() => pathname?.split("/product/")[1]?.split("/")[0] || "", [pathname]);
    const [preview, setPreview] = useState<ProductPreview | null>(null);

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [slug]);

    useEffect(() => {
        if (!slug) return;

        try {
            const stored = sessionStorage.getItem(`${PREVIEW_KEY_PREFIX}${slug}`);
            if (!stored) return;

            const parsed = JSON.parse(stored) as ProductPreview;
            if (!parsed?.expiresAt || parsed.expiresAt < Date.now()) {
                sessionStorage.removeItem(`${PREVIEW_KEY_PREFIX}${slug}`);
                return;
            }

            setPreview(parsed);
        } catch {
            setPreview(null);
        }
    }, [slug]);

    return (
        <div className="bg-background min-h-screen text-foreground pt-2 md:pt-8 pb-8 animate-in fade-in duration-300">
            <div className="container mx-auto px-0 md:px-6">
                <div className="mb-2 md:mb-4 px-3 md:px-0">
                    <div className="flex items-center gap-2">
                        <SkeletonBlock className="h-3 w-12 rounded-md" />
                        <span className="text-muted-foreground/30 text-xs">/</span>
                        <SkeletonBlock className="h-3 w-20 rounded-md" />
                        <span className="text-muted-foreground/30 text-xs">/</span>
                        <SkeletonBlock className="h-3 w-28 rounded-md" />
                    </div>
                </div>

                <section className="flex flex-col md:flex-row gap-2.5 md:gap-8 lg:gap-10 mb-8 md:mb-12 px-0 pb-24 md:pb-0">
                    <div className="w-full md:w-1/2 flex flex-col gap-2 md:gap-4">
                        <div className="relative w-full h-[380px] sm:h-[440px] md:h-[480px] overflow-hidden rounded-none md:rounded-2xl bg-[#AC8717]/10 border-y md:border border-[#AC8717]/20">
                            {preview?.image ? (
                                <Image
                                    src={preview.image}
                                    alt={preview.name}
                                    fill
                                    className="object-contain p-1.5 sm:p-4"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-r from-muted/20 via-[#AC8717]/10 to-muted/20 animate-pulse" />
                            )}
                        </div>

                        <div className="flex gap-2 overflow-hidden px-2 pb-1 justify-start md:justify-center w-full">
                            {[1, 2, 3, 4].map((item) => (
                                <SkeletonBlock key={item} className="w-12 sm:w-16 aspect-square rounded-lg sm:rounded-xl shrink-0" />
                            ))}
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 flex flex-col space-y-2.5 md:space-y-3 pt-0 px-3 md:px-0">
                        <SkeletonBlock className="h-3 w-28 rounded-md" />

                        <div className="space-y-2">
                            {preview?.name ? (
                                <h1 className="text-[19px] sm:text-2xl md:text-3xl font-heading font-semibold text-foreground tracking-wide leading-tight">
                                    {preview.name}
                                </h1>
                            ) : (
                                <>
                                    <SkeletonBlock className="h-8 w-4/5" />
                                    <SkeletonBlock className="h-8 w-2/3" />
                                </>
                            )}
                            <SkeletonBlock className="h-4 w-11/12 rounded-md" />
                            <SkeletonBlock className="h-4 w-3/4 rounded-md" />
                        </div>

                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <SkeletonBlock key={item} className="h-4 w-4 rounded-sm" />
                            ))}
                            <SkeletonBlock className="h-3 w-32 rounded-md" />
                        </div>

                        <hr className="border-border/40" />

                        <div className="space-y-2">
                            <SkeletonBlock className="h-3 w-32 rounded-md" />
                            <div className="flex flex-wrap gap-2">
                                {[preview?.volume || "50ml", "100ml", "Gift"].map((item) => (
                                    <div key={item} className="h-8 min-w-20 rounded-xl border border-border bg-background px-3 flex items-center justify-center">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border border-[#AC8717]/25 bg-white/70 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-5 shadow-xs space-y-3 mt-1 md:mt-2">
                            <div className="space-y-2">
                                {preview?.price ? (
                                    <div className="text-[26px] md:text-3xl font-extrabold tracking-wide text-[#AC8717] leading-none">
                                        {preview.price}
                                    </div>
                                ) : (
                                    <SkeletonBlock className="h-8 w-36" />
                                )}
                                <SkeletonBlock className="h-4 w-40 rounded-md" />
                            </div>

                            <div className="space-y-2 border-y border-border/40 py-2">
                                <SkeletonBlock className="h-3 w-48 rounded-md" />
                                <SkeletonBlock className="h-3 w-56 rounded-md" />
                                <SkeletonBlock className="h-3 w-44 rounded-md" />
                            </div>

                            <div className="space-y-2.5">
                                <SkeletonBlock className="h-10 w-full rounded-full" />
                                <SkeletonBlock className="h-10 w-full rounded-full" />
                            </div>
                        </div>

                        <div className="border-t border-border/40 pt-4 mt-2 space-y-2">
                            <SkeletonBlock className="h-3 w-36 rounded-md" />
                            <SkeletonBlock className="h-9 w-full rounded-lg" />
                            <SkeletonBlock className="h-9 w-full rounded-lg" />
                            <SkeletonBlock className="h-9 w-full rounded-lg" />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
