"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * TawkChat component for integrating Tawk.to live chat.
 * 
 * Handles the script injection and initial configuration.
 * Includes a custom offset for mobile to ensure it doesn't overlap with the bottom of the screen.
 * Restricts rendering strictly to the home page root ('/').
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

    // Initial script load & style configuration
    useEffect(() => {
        const Tawk_API: any = (window as any).Tawk_API || {};
        
        // Avoid duplicate script injection
        if (document.getElementById("tawk-script")) {
            return;
        }

        const Tawk_LoadStart = new Date();

        // Enforce route rules immediately when script finishes loading
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
                mobile: { xOffset: 10, yOffset: 70 } // Decreased offset on mobile
            }
        };

        (window as any).Tawk_API = Tawk_API;
        (window as any).Tawk_LoadStart = Tawk_LoadStart;

        const s1 = document.createElement("script");
        const s0 = document.getElementsByTagName("script")[0];
        s1.id = "tawk-script";
        s1.async = true;
        s1.src = 'https://embed.tawk.to/69d159b6a3c0d11c365da12e/1jlcscsfq';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        
        if (s0 && s0.parentNode) {
            s0.parentNode.insertBefore(s1, s0);
        } else {
            document.head.appendChild(s1);
        }
    }, []);

    return (
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

