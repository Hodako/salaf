import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopContent } from '@/components/shop/ShopContent';
import { Collection, Product } from '@/models';
import { dbConnect } from '@/helpers';

interface CollectionPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
    const { slug } = await params;
    await dbConnect();
    const collection = await Collection.findOne({ slug }).lean() as any;
    
    if (!collection) return { title: 'Collection Not Found | Salaf - سلف' };

    const title = `${collection.name} Collection | Luxury Fragrance Selection | Salaf`;
    const description = collection.description || `Browse our fine selection of fragrances in the ${collection.name} collection at Salaf. Crafted for tradition, purity, and lasting elegance.`;
    const image = collection.imageUrl || "/og-image.png";

    return {
        title,
        description,
        alternates: {
            canonical: `https://salaf.bd/collections/${collection.slug}`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `https://salaf.bd/collections/${collection.slug}`,
            images: [{ url: image, alt: collection.name }],
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

export default async function CollectionPage({ params }: CollectionPageProps) {
    const { slug } = await params;
    await dbConnect();
    const collection = await Collection.findOne({ slug }).lean() as any;

    if (!collection) return notFound();

    // Compile breadcrumbs list for UI and Schema
    const breadcrumbs = [
        { name: 'Home', url: 'https://salaf.bd' },
        { name: 'Shop', url: 'https://salaf.bd/shop' },
        { name: collection.name, url: `https://salaf.bd/collections/${collection.slug}` }
    ];

    // Fetch sample products in this collection to satisfy CollectionPage schema requirements
    const sampleProducts = await Product.find({ collections: collection._id })
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
        "name": collection.name,
        "description": collection.description || `Fine fragrances in collection ${collection.name}`,
        "url": `https://salaf.bd/collections/${collection.slug}`,
        "image": collection.imageUrl || "https://salaf.bd/og-image.png",
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

            <div className="container mx-auto px-4 md:px-6">
                {/* Semantic & Accessible Breadcrumbs */}
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

                {/* Premium Collection SEO Intro Section with Golden Accents */}
                <header className="relative mb-12 rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#120f0a] via-[#090806] to-[#1a150e] border border-white/5 py-16 px-8 md:px-16 text-center text-white shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1),transparent_70%)] pointer-events-none" />
                    
                    <h1 className="text-4xl md:text-6xl font-heading font-medium text-[#d4af37] tracking-wider mb-6 leading-tight drop-shadow-md">
                        {collection.name}
                    </h1>
                    
                    <p className="max-w-3xl mx-auto text-white/80 text-sm md:text-base font-light leading-relaxed mb-4">
                        {collection.description || `Explore our handpicked curation of exceptional ${collection.name} scents. Uncompromising quality and timeless depth for the true connoisseur.`}
                    </p>
                    
                    <div className="w-16 h-[2px] bg-[#d4af37]/60 mx-auto mt-6 rounded-full" />
                </header>

                <ShopContent initialFilters={{ collection: collection.slug, title: collection.name }} />
            </div>
        </main>
    );
}
