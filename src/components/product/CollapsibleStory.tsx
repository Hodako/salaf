"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleStoryProps {
    children: React.ReactNode;
    threshold?: number;
}

/**
 * A client-side wrapper that handles the visual clipping of long story content.
 * 
 * SEO NOTE: All content is rendered as children on the server, ensuring it stays
 * in the HTML source code for search engine indexing. We only use CSS max-height
 * and transition for the interactive reveal.
 */
export function CollapsibleStory({ children, threshold = 600 }: CollapsibleStoryProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [shouldShowButton, setShouldShowButton] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Initial check and re-check on content updates using ResizeObserver for better performance
    useEffect(() => {
        if (!contentRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                // Use scrollHeight to detect if content is overflowing the threshold
                const target = entry.target as HTMLDivElement;
                setShouldShowButton(target.scrollHeight > threshold + 50);
            }
        });

        observer.observe(contentRef.current);
        return () => observer.disconnect();
    }, [threshold]);

    // If content is short, just render it normally
    if (!shouldShowButton && !isExpanded) {
        return <div ref={contentRef}>{children}</div>;
    }

    return (
        <div className="relative w-full">
            <div
                ref={contentRef}
                className={cn(
                    "relative overflow-hidden transition-all duration-1000 ease-in-out",
                    isExpanded ? "max-h-[8000px]" : ""
                )}
                style={{
                    maxHeight: isExpanded ? "8000px" : `${threshold}px`,
                }}
            >
                {children}

                {/* Elegant Fade-out Overlay */}
                {!isExpanded && (
                    <div
                        className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-background via-background/90 to-transparent pointer-events-none z-10"
                        aria-hidden="true"
                    />
                )}
            </div>

            {/* Toggle Action */}
            <div className={cn(
                "flex justify-center relative z-20 mb-8",
                isExpanded ? "mt-0" : "-mt-8" // Pull button up slightly when not expanded to sit on the fade
            )}>
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsExpanded(!isExpanded);
                        // If closing, scroll slightly back up to the story area
                        if (isExpanded && typeof window !== 'undefined') {
                            contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }}
                    className="group bg-transparent hover:bg-bprimary/5 text-bprimary border border-bprimary/30 hover:border-bprimary rounded-full px-8 py-4 h-auto text-[11px] uppercase tracking-widest font-bold transition-all"
                >
                    {isExpanded ? (
                        <>
                            Show Less <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-1" />
                        </>
                    ) : (
                        <>
                            Read More <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-1" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
