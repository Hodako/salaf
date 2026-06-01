import { Hero, AboutUs, OurValues, FeaturedProducts } from "@/components/home";
import { dbConnect } from "@/helpers";
import { Page } from "@/models";
import { Metadata } from "next";

import { TemplateInjector } from "@/components/blocks/TemplateInjector";

// Types
import { HeroSectionData, AboutSectionData, ValuesSectionData, FeaturedProductsSectionData } from "@/types";

// Allow Next.js to cache the landing page HTML and only refresh periodically.
// This significantly improves TTFB and overall load time.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
    try {
        await dbConnect();
        const pageQuery: any = {
            $or: [
                { isHome: true },
                { slug: '/' },
                { slug: 'home' }
            ],
            status: { $ne: 'draft' }
        };
        const page = await Page.findOne(pageQuery).lean() as any;
        if (page?.seo?.title) {
            return {
                title: page.seo.title,
                description: page.seo.description,
                openGraph: {
                    title: page.seo.title,
                    description: page.seo.description,
                    images: page.seo.ogImage ? [{ url: page.seo.ogImage }] : [],
                }
            };
        }
    } catch (e) {}
    
    return {
        title: "Home | Salaf - سلف",
        description: "Welcome to Salaf - سلف. Discover our collection of premium, pure and traditional fragrances.",
    };
}

export default async function Home() {
    let page = null;
    let preloadedHero = null;
    let preloadedSpotlight = null;

    try {
        // Only attempt to connect and fetch if the URI exists to prevent build failures
        if (process.env.MONGODB_URI) {
            await dbConnect();
            const pageQuery: any = {
                $or: [
                    { isHome: true },
                    { slug: '/' },
                    { slug: 'home' }
                ],
                status: { $ne: 'draft' }
            };
            page = await Page.findOne(pageQuery).lean();

            // Fetch settings for preloading (Hero slides and Spotlight products)
            const { Settings: SettingsModel, Product: ProductModel } = require("@/models");
            const settingsDoc = await SettingsModel.find({
                key: { $in: ['hero_slides', 'spotlight_section', 'spotlight_sections'] }
            }).lean();

            const configMap = settingsDoc.reduce((acc: any, curr: any) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {});

            if (configMap.hero_slides) {
                preloadedHero = JSON.parse(JSON.stringify(configMap.hero_slides));
            }

            let sectionsList: any[] = [];
            if (configMap.spotlight_sections) {
                sectionsList = configMap.spotlight_sections;
            } else if (configMap.spotlight_section) {
                sectionsList = [configMap.spotlight_section];
            }

            if (sectionsList.length > 0) {
                const allProductIds = Array.from(
                    new Set(sectionsList.flatMap((s) => s.productIds || []))
                ).filter(Boolean);

                if (allProductIds.length > 0) {
                    const productsList = await ProductModel.find({
                        _id: { $in: allProductIds }
                    }).populate("collections tags brand").lean();

                    const productMap = productsList.reduce((acc: any, p: any) => {
                        acc[p._id.toString()] = p;
                        return acc;
                    }, {});

                    const enriched = sectionsList.map((sec) => ({
                        title: sec.title || "Product Spotlight",
                        subtitle: sec.subtitle || "",
                        productIds: sec.productIds || [],
                        products: (sec.productIds || [])
                            .map((id: string) => productMap[id.toString()])
                            .filter(Boolean),
                    }));

                    preloadedSpotlight = JSON.parse(JSON.stringify(enriched));
                }
            }
        }
    } catch (error) {
        console.error("Home page fetch/preload error:", error);
    }


    return (
        <main className="min-h-screen bg-background">
            {page?.html ? (
                <>
                    {page.css && <style dangerouslySetInnerHTML={{ __html: page.css }} />}
                    <TemplateInjector html={page.html} preloadedHero={preloadedHero} preloadedSpotlight={preloadedSpotlight} />
                </>
            ) : (
                page?.sections?.map((section: any, index: number) => {
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
