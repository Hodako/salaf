"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

/**
 * TawkChat component for integrating Tawk.to live chat.
 * 
 * Optimized with Next.js Script component and lazy-loading.
 * Includes a custom offset for mobile and restricts rendering strictly to the home page root ('/').
 */
export const TawkChat = () => {
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    // Route-specific visibility handler
    useEffect(() => {
        const Tawk_API: any = (window as any).Tawk_API || {};

        if (Tawk_API.hideWidget && Tawk_API.showWidget) {
            if (isHomePage) {
                Tawk_API.showWidget();
            } else {
                Tawk_API.hideWidget();
            }
        }
    }, [isHomePage, pathname]);

    const handleScriptLoad = () => {
        const initTawk = () => {
            const Tawk_API: any = (window as any).Tawk_API || {};

            Tawk_API.onLoad = function() {
                const currentPath = window.location.pathname;
                if (currentPath === '/') {
                    Tawk_API.showWidget();
                } else {
                    Tawk_API.hideWidget();
                }
            };

            Tawk_API.customStyle = {
                visibility: {
                    desktop: { xOffset: 20, yOffset: 20 },
                    mobile: { xOffset: 10, yOffset: 70 }
                }
            };

            (window as any).Tawk_API = Tawk_API;
        };

        // Initialize only during idle time to prevent blocking main thread
        if ("requestIdleCallback" in window) {
            (window as any).requestIdleCallback(initTawk);
        } else {
            setTimeout(initTawk, 2000);
        }
    };

    return (
        <>
            <Script
                id="tawk-script"
                src="https://embed.tawk.to/69d159b6a3c0d11c365da12e/1jlcscsfq"
                strategy="lazyOnload"
                onLoad={handleScriptLoad}
            />
            <style dangerouslySetInnerHTML={{ __html: `
            @media (max-width: 639px) {
                /* Target Tawk.to iframe container elements to shrink size on mobile */
                iframe[src*="tawk.to"],
                iframe[title="chat widget"],
                iframe[id^="tawkchat"],
                .tawk-min-container {
                    transform: scale(0.75) !important;
                    transform-origin: bottom right !important;
                }
            }
        `}} />
    );
};

