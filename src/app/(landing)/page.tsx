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
    const defaultTitle = "Salaf - سلف | Premium Fragrance Collection";
    const defaultDescription = "𝐒𝐚𝐥𝐚𝐟 — سلف is not just a fragrance, it's a journey back to Purity, Tradition & Timeless Elegance 🌟 Explore our curated collection of premium attars and perfumes.";
    const defaultOgImage = "/og-image.png";

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
            const title = page.seo.title;
            const description = page.seo.description || defaultDescription;
            const image = page.seo.ogImage || defaultOgImage;

            return {
                title,
                description,
                alternates: {
                    canonical: "https://salaf.bd",
                },
                openGraph: {
                    title,
                    description,
                    type: "website",
                    url: "https://salaf.bd",
                    siteName: "Salaf - سلف",
                    images: [{ url: image, alt: title }],
                },
                twitter: {
                    card: "summary_large_image",
                    title,
                    description,
                    images: [image],
                }
            };
        }
    } catch (e) {}
    
    return {
        title: defaultTitle,
        description: defaultDescription,
        alternates: {
            canonical: "https://salaf.bd",
        },
        openGraph: {
            title: defaultTitle,
            description: defaultDescription,
            type: "website",
            url: "https://salaf.bd",
            siteName: "Salaf - سلف",
            images: [{ url: defaultOgImage, width: 1200, height: 630, alt: "Salaf Fragrance" }],
        },
        twitter: {
            card: "summary_large_image",
            title: defaultTitle,
            description: defaultDescription,
            images: [defaultOgImage],
        }
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


    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Salaf - سلف",
        "url": "https://salaf.bd",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://salaf.bd/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    const storeSchema = {
        "@context": "https://schema.org",
        "@type": "Store",
        "name": "Salaf - سلف",
        "image": "https://salaf.bd/og-image.png",
        "@id": "https://salaf.bd/#store",
        "url": "https://salaf.bd",
        "telephone": "+8801700000000",
        "priceRange": "$$",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Mirpur",
            "addressLocality": "Dhaka",
            "postalCode": "1216",
            "addressCountry": "BD"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 23.8041,
            "longitude": 90.3687
        },
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ],
            "opens": "09:00",
            "closes": "21:00"
        },
        "sameAs": [
            "https://www.facebook.com/salaf.bd",
            "https://www.instagram.com/salaf.bd"
        ]
    };

    return (
        <main className="min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
            />
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
