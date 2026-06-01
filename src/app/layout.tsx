import type { Metadata } from "next";
import { Lato, Cinzel } from "next/font/google";
import "./globals.css";
import { GoogleTagManager } from "@next/third-parties/google";
import { Providers } from "./providers";
import { TawkChat } from "@/components/layout/TawkChat";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700", "900", "100", "300"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://salaf.bd"),
  title: {
    default: "Salaf - سلف | Premium Fragrance Collection",
    template: "%s | Salaf - سلف"
  },
  description: "𝐒𝐚𝐥𝐚𝐟 — سلف is not just a fragrance, it's a journey back to Purity, Tradition & Timeless Elegance 🌟 Explore our curated collection of premium attars and perfumes.",
  keywords: ["attar", "perfume", "fragrance", "premium", "traditional", "elegant", "Salaf", "سلف"],
  authors: [{ name: "Salaf" }],
  creator: "Salaf",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://salaf.bd",
    siteName: "Salaf - سلف",
    title: "Salaf - سلف | Premium Fragrance Collection",
    description: "𝐒𝐚𝐥𝐚𝐟 — سلف is not just a fragrance, it's a journey back to Purity, Tradition & Timeless Elegance",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Salaf Fragrance" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Salaf - سلف | Premium Fragrance Collection",
    description: "𝐒𝐚𝐥𝐚𝐟 — سلف is not just a fragrance, it's a journey back to Purity, Tradition & Timeless Elegance",
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true
  }
};

/**
 * The root layout component for the entire application.
 * 
 * Provides the base HTML structure, global fonts (Outfit, Inter), 
 * and persistent UI elements like the Navbar, Footer, and Cart Sidebar. 
 * Wraps the application in the necessary client-side providers.
 * 
 * @param props - The layout props containing the child content.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light bg-background" suppressHydrationWarning>
      <body
        className={`${cinzel.variable} ${lato.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {/* Ambient luxury backgrounds (Water wave and sparkle patterns) */}
          <div className="premium-bg-decoration" aria-hidden="true" />
          <div className="premium-sparkle-overlay" aria-hidden="true" />
          {children}
          <TawkChat />
        </Providers>
      </body>
      <GoogleTagManager gtmId="GTM-K9CG9CLS" />
    </html>
  );
}
