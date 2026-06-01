import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopContent } from '@/components/shop/ShopContent';
import { Collection } from '@/models';
import { dbConnect } from '@/helpers';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    await dbConnect();
    const collection = await Collection.findOne({ slug });
    
    if (!collection) return { title: 'Collection Not Found' };
    
    return {
        title: `${collection.name} | Shop Fragrances`,
        description: collection.description || `Explore our exclusive ${collection.name} collection.`,
    };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    await dbConnect();
    const collection = await Collection.findOne({ slug }).lean();

    if (!collection) return notFound();

    return <ShopContent initialFilters={{ collection: collection.slug, title: collection.name }} />;
}
