import { ShopContent } from "@/components/shop/ShopContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shop Fragrances | Premium Perfume & Attar Collection | Salaf - سلف",
    description: "Explore our premium collection of artisanal fragrances. From deep ouds and mystical ambers to fresh florals and rich jasmines, find your signature scent at Salaf.",
    alternates: {
        canonical: "https://salaf.bd/shop",
    },
    openGraph: {
        title: "Shop Fragrances | Salaf - سلف",
        description: "Explore our premium collection of artisanal fragrances. From deep ouds and mystical ambers to fresh florals.",
        type: "website",
        url: "https://salaf.bd/shop",
        images: [{ url: "/og-image.png", alt: "Salaf Fragrance Shop" }],
        siteName: "Salaf - سلف"
    },
    twitter: {
        card: "summary_large_image",
        title: "Shop Fragrances | Salaf - سلف",
        description: "Explore our premium collection of artisanal fragrances. From deep ouds and mystical ambers to fresh florals.",
        images: ["/og-image.png"]
    }
};

export default function ShopPage() {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://salaf.bd" },
            { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://salaf.bd/shop" }
        ]
    };

    return (
        <main className="min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <ShopContent />
        </main>
    );
}
