import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopContent } from '@/components/shop/ShopContent';
import { Brand, Product } from '@/models';
import { dbConnect } from '@/helpers';

interface BrandPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
    const { slug } = await params;
    await dbConnect();
    const brand = await Brand.findOne({ slug }).lean() as any;
    
    if (!brand) return { title: 'Brand Not Found | Salaf - سلف' };

    const title = `${brand.name} Fragrances | Premium Perfumery House | Salaf`;
    const description = brand.description || `Explore the exquisite olfactory creations from the House of ${brand.name} at Salaf. Crafted for timeless elegance and premium depth.`;
    const image = brand.imageUrl || "/og-image.png";

    return {
        title,
        description,
        alternates: {
            canonical: `https://salaf.bd/brands/${brand.slug}`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `https://salaf.bd/brands/${brand.slug}`,
            images: [{ url: image, alt: brand.name }],
            siteName: "Salaf - سلف"
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        }
    };
}

export default async function BrandPage({ params }: BrandPageProps) {
    const { slug } = await params;
    await dbConnect();
    const brand = await Brand.findOne({ slug }).lean() as any;

    if (!brand) return notFound();

    // Compile breadcrumbs list for UI and Schema
    const breadcrumbs = [
        { name: 'Home', url: 'https://salaf.bd' },
        { name: 'Shop', url: 'https://salaf.bd/shop' },
        { name: brand.name, url: `https://salaf.bd/brands/${brand.slug}` }
    ];

    // Fetch sample products in this brand to satisfy CollectionPage schema requirements
    const sampleProducts = await Product.find({ brand: brand._id })
        .select('name slug featuredImage')
        .limit(10)
        .lean() as any[];

    // Generate JSON-LD BreadcrumbList and CollectionPage Schemas
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "name": item.name,
            "item": item.url
        }))
    };

    const collectionPageSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": brand.name,
        "description": brand.description || `Fine fragrances from brand ${brand.name}`,
        "url": `https://salaf.bd/brands/${brand.slug}`,
        "image": brand.imageUrl || "https://salaf.bd/og-image.png",
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": sampleProducts.length,
            "itemListElement": sampleProducts.map((p, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "url": `https://salaf.bd/product/${p.slug}`,
                "name": p.name,
                "image": p.featuredImage
            }))
        }
    };

    return (
        <main className="min-h-screen bg-background text-foreground pt-4 md:pt-24 pb-12 overflow-x-hidden">
            {/* Inject JSON-LD Rich Snippets */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
            />

            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Accessible Breadcrumbs */}
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
                                    <a href={crumb.url === 'https://salaf.bd' ? '/' : crumb.url.replace('https://salaf.bd', '')} className="hover:text-foreground transition-colors">
                                        {crumb.name}
                                    </a>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>

                {/* Premium Brand SEO Intro Section with Golden Accents */}
                <header className="relative mb-6 md:mb-12 rounded-xl md:rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#120f0a] via-[#090806] to-[#1a150e] border border-white/5 py-8 px-4 md:py-16 md:px-16 text-center text-white shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1),transparent_70%)] pointer-events-none" />
                    
                    <h1 className="text-2xl md:text-6xl font-heading font-medium text-[#d4af37] tracking-wider mb-3 md:mb-6 leading-tight drop-shadow-md">
                        {brand.name}
                    </h1>
                    
                    <p className="hidden md:block max-w-3xl mx-auto text-white/80 text-sm md:text-base font-light leading-relaxed mb-4">
                        {brand.description || `Discover the exclusive olfactory universe of ${brand.name}. Expert craftsmanship, premium raw materials, and exceptional longevity.`}
                    </p>

                    <details className="group md:hidden max-w-xl mx-auto bg-white/5 border border-white/10 rounded-lg p-2.5 mt-2 transition-all open:bg-white/10">
                        <summary className="flex items-center justify-between text-[10px] font-bold text-[#d4af37] cursor-pointer uppercase tracking-widest select-none list-none [&::-webkit-details-marker]:hidden">
                            <span>Read Brand Description</span>
                            <span className="text-[8px] transition-transform duration-300 group-open:rotate-180">▼</span>
                        </summary>
                        <p className="text-white/70 text-xs font-light leading-relaxed mt-2 text-left border-t border-white/5 pt-2">
                            {brand.description || `Discover the exclusive olfactory universe of ${brand.name}. Expert craftsmanship, premium raw materials, and exceptional longevity.`}
                        </p>
                    </details>
                    
                    <div className="w-12 h-[2px] bg-[#d4af37]/60 mx-auto mt-4 md:mt-6 rounded-full" />
                </header>

                <ShopContent initialFilters={{ brand: brand.slug, title: brand.name }} />
            </div>
        </main>
    );
}
