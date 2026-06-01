import { ShopContent } from "@/components/shop/ShopContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shop | Professional Grade Attar & Perfumes",
    description: "Explore our premium collection of artisanal fragrances. From deep ouds to fresh florals, find your signature scent at Salaf.",
    openGraph: {
        title: "Shop Fragrances | Salaf",
        description: "Artisanal Attars & Perfumes",
    }
};

export default function ShopPage() {
    return <ShopContent />;
}
