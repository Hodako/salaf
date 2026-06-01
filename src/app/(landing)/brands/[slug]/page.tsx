import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopContent } from '@/components/shop/ShopContent';
import { Brand } from '@/models';
import { dbConnect } from '@/helpers';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    await dbConnect();
    const brand = await Brand.findOne({ slug });
    
    if (!brand) return { title: 'Brand Not Found' };
    
    return {
        title: `${brand.name} | Shop Fragrances`,
        description: brand.description || `Explore our exclusive collection of fragrances from ${brand.name}.`,
    };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    await dbConnect();
    const brand = await Brand.findOne({ slug }).lean();

    if (!brand) return notFound();

    return <ShopContent initialFilters={{ brand: brand.slug, title: brand.name }} />;
}
