import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopContent } from '@/components/shop/ShopContent';
import { Category, Product } from '@/models';
import { dbConnect } from '@/helpers';

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    await dbConnect();
    const category = await Category.findOne({ slug: { $regex: new RegExp("^" + slug + "$", "i") }, isActive: true }).lean() as any;

    if (!category) return { title: 'Category Not Found | Salaf - سلف' };

    const title = `${category.name} | Premium Fragrances & Scent Selection | Salaf`;
    const description = category.description || `Browse our fine selection of ${category.name} at Salaf. Crafted for tradition, purity, and lasting elegance.`;

    return {
        title,
        description,
        alternates: {
            canonical: `https://salaf.bd/category/${category.slug}`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `https://salaf.bd/category/${category.slug}`,
            images: category.imageUrl ? [{ url: category.imageUrl, alt: category.name }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: category.imageUrl ? [category.imageUrl] : [],
        }
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = await params;
    await dbConnect();

    // 1. Fetch current Category
    const category = await Category.findOne({ slug: { $regex: new RegExp("^" + slug + "$", "i") }, isActive: true }).lean() as any;
    if (!category) return notFound();

    // 2. Fetch Parent category if exists for breadcrumbs hierarchy
    let parentCategory = null;
    if (category.parent) {
        parentCategory = await Category.findById(category.parent).lean() as any;
    }

    // 3. Compile breadcrumbs list for UI and Schema
    const breadcrumbs = [
        { name: 'Home', url: 'https://salaf.bd' },
        { name: 'Shop', url: 'https://salaf.bd/shop' },
    ];
    if (parentCategory) {
        breadcrumbs.push({ name: parentCategory.name, url: `https://salaf.bd/category/${parentCategory.slug}` });
    }
    breadcrumbs.push({ name: category.name, url: `https://salaf.bd/category/${category.slug}` });

    // 4. Fetch a sample of products in this category to satisfy CollectionPage schema requirements
    const productQuery = category.level === 0 ? { category: category._id } : { subcategory: category._id };
    const sampleProducts = await Product.find(productQuery)
        .select('name slug featuredImage variations')
        .limit(10)
        .lean() as any[];

    // 5. Generate JSON-LD BreadcrumbList and CollectionPage Schemas
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
        "name": category.name,
        "description": category.description || `Fine fragrances in category ${category.name}`,
        "url": `https://salaf.bd/category/${category.slug}`,
        "image": category.imageUrl,
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

                {/* Premium Category SEO Intro Section with Golden Accents */}
                <header className="relative mb-12 rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#120f0a] via-[#090806] to-[#1a150e] border border-white/5 py-16 px-8 md:px-16 text-center text-white shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1),transparent_70%)] pointer-events-none" />
                    
                    <h1 className="text-4xl md:text-6xl font-heading font-medium text-[#d4af37] tracking-wider mb-6 leading-tight drop-shadow-md">
                        {category.name}
                    </h1>
                    
                    <p className="max-w-3xl mx-auto text-white/80 text-sm md:text-base font-light leading-relaxed mb-4">
                        {category.description || `Explore our handpicked curation of exceptional ${category.name} scents. Uncompromising quality and timeless depth for the true connoisseur.`}
                    </p>
                    
                    <div className="w-16 h-[2px] bg-[#d4af37]/60 mx-auto mt-6 rounded-full" />
                </header>

                {/* Render Products Matching this Category */}
                <ShopContent
                    initialFilters={{
                        category: category.slug,
                        title: `Luxury ${category.name} Fragrances`
                    }}
                />
            </div>
        </main>
    );
}
