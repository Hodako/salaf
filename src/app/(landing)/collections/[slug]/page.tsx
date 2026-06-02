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
        <>
            {/* Inject JSON-LD Rich Snippets */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
            />

            <ShopContent initialFilters={{ collection: collection.slug, title: collection.name }} />
        </>
    );
}
