import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { dbConnect } from "@/helpers";
import { Page } from "@/models";
import { TemplateInjector } from "@/components/blocks/TemplateInjector";

// Legacy imports for backwards compatibility
import { Hero, AboutUs, OurValues, FeaturedProducts } from "@/components/home";
import { HeroSectionData, AboutSectionData, ValuesSectionData, FeaturedProductsSectionData } from "@/types";

// Cache published CMS pages for a short period to improve load times.
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        const { slug } = await params;
        await dbConnect();
        
        const page = await Page.findOne({ slug, status: 'published', type: 'page' }).lean() as any;
        
        if (page?.seo?.title) {
            return {
                title: `${page.seo.title} | Salaf - سلف`,
                description: page.seo.description,
                openGraph: {
                    title: page.seo.title,
                    description: page.seo.description,
                    images: page.seo.ogImage ? [{ url: page.seo.ogImage }] : [],
                }
            };
        }

        if (page?.title) {
            return { title: `${page.title} | Salaf - سلف` };
        }
    } catch (e) {}

    return { title: "Salaf - سلف" };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    
    // Protect internal routes from being caught here accidentally 
    // Usually NextJS router specificity handles this, but good to be safe if 'product' isn't explicitly defined in landing
    if (['product', 'shop', 'checkout', 'p', 'category', 'blog'].includes(slug.toLowerCase())) {
         return notFound();
    }

    let page = null;
    try {
        await dbConnect();
        // Fetch published standard pages
        page = await Page.findOne({ slug, status: 'published', type: 'page' }).lean() as any;
    } catch (error) {
        console.error(`Page fetch error for slug ${slug}:`, error);
    }

    if (!page) {
        return notFound();
    }

    return (
        <main className="min-h-screen">
            {page.html ? (
                <>
                    {page.css && <style dangerouslySetInnerHTML={{ __html: page.css }} />}
                    <TemplateInjector html={page.html} isStaticPage={true} />
                </>
            ) : (
                /* Fallback for legacy database records that only have blocks */
                page.sections?.map((section: any, index: number) => {
                    if (section.type === "hero") {
                        return <Hero key={index} data={section.data as HeroSectionData} />;
                    }
                    if (section.type === "about") {
                        return <AboutUs key={index} data={section.data as AboutSectionData} />;
                    }
                    if (section.type === "values") {
                        return <OurValues key={index} data={section.data as ValuesSectionData} />;
                    }
                    if (section.type === "featured_products") {
                        return <FeaturedProducts key={index} data={section.data as FeaturedProductsSectionData} />;
                    }
                    return null;
                })
            )}
        </main>
    );
}
