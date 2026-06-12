import { Metadata } from 'next';
import Link from 'next/link';
import { Brand } from '@/models';
import { dbConnect } from '@/helpers';
import { Award } from 'lucide-react';
import BrandsListClient from '@/components/brands/BrandsListClient';

export const revalidate = 60; // Cache for a minute to keep page speed optimal

export const metadata: Metadata = {
    title: 'Fragrance Brands | Premium Perfumery Houses | Salaf - سلف',
    description: 'Explore our curated selection of premium perfumery houses at Salaf. Discover unique fragrance collections from world-class artisans.',
    alternates: {
        canonical: 'https://salaf.bd/brands',
    },
    openGraph: {
        title: 'Fragrance Brands | Premium Perfumery Houses | Salaf',
        description: 'Explore our curated selection of premium perfumery houses at Salaf. Discover unique fragrance collections from world-class artisans.',
        type: 'website',
        url: 'https://salaf.bd/brands',
        images: [{ url: '/og-image.png', alt: 'Salaf Brands' }],
    }
};

export default async function BrandsPage() {
    await dbConnect();
    const brands = await Brand.find({}).sort({ name: 1 }).lean() as any[];

    // Sanitize for client component
    const serializedBrands = JSON.parse(JSON.stringify(brands));

    const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Brands', url: '/brands' }
    ];

    return (
        <main className="min-h-screen bg-background text-foreground pt-4 md:pt-24 pb-16 overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-2 md:px-6">
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="mb-6 md:mb-10">
                    <ol className="flex items-center flex-wrap gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                        {breadcrumbs.map((crumb, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                                {idx > 0 && <span aria-hidden="true">/</span>}
                                {idx === breadcrumbs.length - 1 ? (
                                    <span className="text-muted-foreground" aria-current="page">
                                        {crumb.name}
                                    </span>
                                ) : (
                                    <Link href={crumb.url} className="hover:text-foreground transition-colors">
                                        {crumb.name}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>

                {/* Header Section */}
                <header className="relative mb-10 md:mb-16 rounded-3xl overflow-hidden bg-gradient-to-br from-[#120f0a] via-[#090806] to-[#1a150e] border border-white/5 py-12 px-6 md:py-20 md:px-16 text-center text-white shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12),transparent_75%)] pointer-events-none" />
                    
                    <Award className="w-12 h-12 text-[#d4af37] mx-auto mb-4 animate-pulse" />
                    <h1 className="text-3xl md:text-6xl font-heading font-medium text-[#d4af37] tracking-wider mb-4 md:mb-6 leading-tight drop-shadow-md">
                        Our Perfumery Houses
                    </h1>
                    <p className="max-w-2xl mx-auto text-white/80 text-sm md:text-base font-light leading-relaxed">
                        Step into a realm of olfactory masterpieces. We partner with the most distinguished fragrance brands to bring you pure, authentic, and long-lasting attars and perfumes.
                    </p>
                    <div className="w-16 h-[2px] bg-[#d4af37]/60 mx-auto mt-6 md:mt-8 rounded-full" />
                </header>

                <BrandsListClient initialBrands={serializedBrands} />
            </div>
        </main>
    );
}
