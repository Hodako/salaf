"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, ShoppingCart, User, Heart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

/**
 * Mobile-only bottom navigation bar.
 * Amazon / croynow.com style: dark background, sharp edges, tight layout.
 */
const BottomNav = () => {
  const pathname = usePathname();
  const { toggleCart, totalItems } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const { toggleWishlistSidebar, wishlist } = useWishlist();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let retryCount = 0;
    const maxRetries = 10;

    const setupObserver = () => {
      const footer = document.querySelector("footer");
      if (footer) {
        observer = new IntersectionObserver(
          ([entry]) => {
            setIsVisible(!entry.isIntersecting);
          },
          {
            root: null,
            rootMargin: "0px",
            threshold: 0.05,
          }
        );
        observer.observe(footer);
        return true;
      }
      return false;
    };

    const success = setupObserver();

    let intervalId: NodeJS.Timeout | null = null;
    if (!success) {
      intervalId = setInterval(() => {
        retryCount++;
        const ok = setupObserver();
        if (ok || retryCount >= maxRetries) {
          if (intervalId) clearInterval(intervalId);
        }
      }, 300);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (observer) observer.disconnect();
    };
  }, [pathname]);

  if (pathname.startsWith("/product/") || pathname === "/checkout" || pathname === "/thank-you") {
    return null;
  }

  const userHref = !isAuthenticated ? "/auth" : (isAdmin ? "/admin/dashboard" : "/dashboard");

  const navItems = [
    { label: "Home",     icon: Home,        href: "/" },
    { label: "Shop",     icon: Store,       href: "/shop" },
    { label: "Cart",     icon: ShoppingCart, onClick: toggleCart, isCart: true },
    { label: "Wishlist", icon: Heart,        onClick: toggleWishlistSidebar, isWishlist: true },
    { label: "Account",  icon: User,        href: userHref },
  ];

  return (
    <div className={cn(
      "md:hidden fixed bottom-0 left-0 w-full z-[100] transition-transform duration-300 ease-in-out transform",
      isVisible ? "translate-y-0" : "translate-y-full"
    )}>
      <nav
        className="gold-gradient gold-bevel flex items-stretch justify-around shadow-[0_-8px_30px_rgba(172,135,23,0.45)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {navItems.map((item) => {
          const isActive = item.href ? pathname === item.href : false;
          const Icon = item.icon;
          const baseClass = "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-1 relative transition-all duration-300";
          const activeClass = isActive ? "text-gray-950 font-black scale-105 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]" : "text-gray-900/70 hover:text-gray-950 active:scale-95";

          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={cn(baseClass, activeClass)}
              >
                <div className="relative">
                  <Icon className="w-4.5 h-4.5" strokeWidth={isActive ? 2.2 : 1.8} />
                  {item.isCart && totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-gray-950 text-white text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center leading-none rounded-full shadow-xs">
                      {totalItems}
                    </span>
                  )}
                  {item.isWishlist && wishlist.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-gray-950 text-white text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center leading-none rounded-full shadow-xs">
                      {wishlist.length}
                    </span>
                  )}
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.06em] mt-0.5 leading-none">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href || "/"}
              className={cn(baseClass, activeClass)}
            >
              <div className="relative">
                <Icon className="w-4.5 h-4.5" strokeWidth={isActive ? 2.2 : 1.8} />
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.06em] mt-0.5 leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export { BottomNav };
