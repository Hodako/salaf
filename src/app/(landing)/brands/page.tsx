import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Brand } from '@/models';
import { dbConnect } from '@/helpers';
import { Award, ArrowRight } from 'lucide-react';

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

                {brands.length === 0 ? (
                    <div className="text-center py-20 bg-card/50 rounded-3xl border border-dashed border-border/80 max-w-lg mx-auto p-8 shadow-sm">
                        <Award className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                        <h3 className="font-heading font-semibold text-lg text-foreground mb-2">No Brands Found</h3>
                        <p className="text-muted-foreground text-xs font-light mb-6">We are currently updating our collection of fragrance houses. Please check back soon.</p>
                        <Link href="/shop" className="inline-block bg-[#AC8717] hover:bg-[#967412] text-white px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest transition-colors shadow-sm">
                            Browse All Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {brands.map((brand) => (
                            <Link 
                                key={brand._id.toString()}
                                href={`/brands/${brand.slug}`}
                                className="group relative bg-card/60 hover:bg-card border border-border/60 hover:border-bprimary/40 rounded-[2rem] p-6 flex flex-col items-center text-center transition-all duration-500 hover:shadow-[0_12px_40px_-12px_rgba(172,135,23,0.25)] hover:-translate-y-1 overflow-hidden"
                            >
                                {/* Decorative surface light accent */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-bprimary/5 rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                {/* Circular Brand Logo container */}
                                <div className="relative w-28 h-28 rounded-full overflow-hidden bg-[#eeeae3] border border-border shadow-inner p-1 mb-5 transition-transform duration-500 group-hover:scale-105">
                                    <Image
                                        src={brand.logo || "/logo.png"}
                                        alt={`${brand.name} logo`}
                                        fill
                                        sizes="(max-width: 768px) 100px, 112px"
                                        className="object-cover rounded-full"
                                    />
                                </div>

                                <h2 className="font-heading font-bold text-lg text-foreground mb-3 group-hover:text-bprimary-dark transition-colors tracking-wide">
                                    {brand.name}
                                </h2>

                                <p className="text-xs text-muted-foreground font-light leading-relaxed mb-6 line-clamp-3 max-w-[240px]">
                                    {brand.description || `Discover the exclusive olfactory universe of ${brand.name}. Expert craftsmanship, premium ingredients, and exceptional longevity.`}
                                </p>

                                <div className="mt-auto flex items-center gap-1.5 text-bprimary-dark group-hover:text-bprimary font-black uppercase text-[10px] tracking-widest transition-all">
                                    <span>Explore Collection</span>
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
