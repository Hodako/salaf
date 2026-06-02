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
        <div className="bg-background min-h-screen text-foreground pt-2 md:pt-8 pb-24 md:pb-8 animate-in fade-in duration-300">
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

            <div
                className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] gold-gradient gold-bevel text-gray-950 px-4 shadow-[0_-8px_30px_rgba(172,135,23,0.45)]"
                style={{
                    paddingTop: "8px",
                    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)"
                }}
            >
                <div className="flex items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-2.5 max-w-[52%] shrink-0">
                        <div className="w-9 h-9 relative bg-white rounded-lg overflow-hidden border border-black/10 shrink-0 shadow-sm">
                            {preview?.image ? (
                                <Image
                                    src={preview.image}
                                    alt=""
                                    fill
                                    className="object-cover scale-[1.35]"
                                    sizes="36px"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-black/10 animate-pulse" />
                            )}
                        </div>

                        <div className="flex flex-col min-w-0">
                            {preview?.name ? (
                                <span className="text-[10px] font-black text-gray-950 leading-none truncate uppercase font-heading tracking-wide">
                                    {preview.name}
                                </span>
                            ) : (
                                <div className="h-2.5 w-28 bg-black/10 rounded-sm animate-pulse" />
                            )}

                            <div className="flex items-center gap-2 mt-1 leading-none text-gray-800">
                                <span className="text-[8px] font-extrabold uppercase tracking-widest shrink-0 bg-black/5 px-1.5 py-0.5 rounded-sm border border-black/5">
                                    {preview?.volume || "Loading"}
                                </span>
                                <span className="text-gray-800/40 text-[9px] shrink-0">|</span>
                                {preview?.price ? (
                                    <span className="text-[12px] font-black text-gray-950 shrink-0 truncate max-w-20">
                                        {preview.price}
                                    </span>
                                ) : (
                                    <div className="h-3 w-14 bg-black/10 rounded-sm animate-pulse" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-1 justify-end">
                        <button
                            disabled
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md bg-black/10 border-t border-t-white/40 border-b border-b-black/30 border-x border-x-black/15 text-gray-950 opacity-70 cursor-wait"
                            aria-label="Loading cart action"
                        >
                            <div className="h-3.5 w-3.5 rounded-sm bg-black/20 animate-pulse" />
                        </button>

                        <button
                            disabled
                            className="h-9 px-4 bg-black/10 text-gray-950 font-black text-[9px] uppercase tracking-widest rounded-full flex-1 max-w-[120px] flex items-center justify-center cursor-wait shadow-md border-t border-t-white/40 border-b border-b-black/30 border-x border-x-black/15"
                        >
                            Loading
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
