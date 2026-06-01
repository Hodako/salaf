"use client";

import { useEffect, useState } from "react";

export function ReadingProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                const scrolled = (window.scrollY / totalHeight) * 100;
                setProgress(scrolled);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div 
            className="fixed top-0 left-0 w-full h-[3px] bg-[#d4af37]/10 z-[200] pointer-events-none"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Reading progress"
        >
            <div 
                className="h-full bg-[#d4af37] shadow-[0_0_10px_#d4af37] transition-all duration-75 ease-out" 
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
