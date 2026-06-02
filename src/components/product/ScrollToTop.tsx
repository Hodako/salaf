"use client";

import { useEffect } from "react";

interface ScrollToTopProps {
    dependency: any;
}

/**
 * A lightweight client component that forces the window to scroll to the top
 * whenever its dependency (e.g., product ID or slug) changes.
 */
export function ScrollToTop({ dependency }: ScrollToTopProps) {
    useEffect(() => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "instant" });
        }
    }, [dependency]);

    return null;
}
