"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * TawkChat component for integrating Tawk.to live chat.
 * 
 * Handles the script injection and initial configuration.
 * Includes a custom offset for mobile to ensure it doesn't overlap with the BottomNav.
 * Automatically excludes itself from admin routes.
 */
export const TawkChat = () => {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin');

    useEffect(() => {
        const Tawk_API: any = (window as any).Tawk_API || {};

        // If the script is already loaded, just toggle visibility
        if (Tawk_API.hideWidget && Tawk_API.showWidget) {
            if (isAdminPage) {
                Tawk_API.hideWidget();
            } else {
                Tawk_API.showWidget();
            }
            return;
        }

        // If we are on an admin page and the script isn't loaded yet, don't load it
        if (isAdminPage) return;

        // --- Initial Load Logic ---
        const Tawk_LoadStart = new Date();

        Tawk_API.customStyle = {
            visibility: {
                desktop: { xOffset: 20, yOffset: 20 },
                mobile: { xOffset: 15, yOffset: 85 }
            }
        };

        (window as any).Tawk_API = Tawk_API;
        (window as any).Tawk_LoadStart = Tawk_LoadStart;

        const s1 = document.createElement("script");
        const s0 = document.getElementsByTagName("script")[0];
        s1.async = true;
        s1.src = 'https://embed.tawk.to/69d159b6a3c0d11c365da12e/1jlcscsfq';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        
        if (s0 && s0.parentNode) {
            s0.parentNode.insertBefore(s1, s0);
        } else {
            document.head.appendChild(s1);
        }
    }, [isAdminPage, pathname]);

    return null;
};
