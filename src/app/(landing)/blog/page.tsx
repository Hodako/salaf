import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { dbConnect } from "@/helpers";
import { BlogPost, Product } from "@/models";
import { Calendar, User, Clock, ArrowRight } from "lucide-react";

interface BlogPageProps {
    searchParams: Promise<{ type?: string }>;
}

export const metadata: Metadata = {
    title: "Scent Diaries | Premium Perfume & Attar Blog | Salaf - سلف",
    description: "Explore perfume buying guides, Attar layering tutorials, fragrance comparisons, and fragrance longevity secrets. Your guide to premium eastern perfumery at Salaf.",
    alternates: {
        canonical: "https://salaf.bd/blog",
    },
    openGraph: {
        title: "Scent Diaries | Salaf Fragrance Blog",
        description: "Artisanal Perfume Guides, Layering Tutorials & Oud Comparisons.",
        type: "website",
        url: "https://salaf.bd/blog",
    }
};

// Seeding function to populate the database with premium, rich posts on first access
async function seedBlogPostsIfEmpty() {
    const count = await BlogPost.countDocuments();
    if (count > 0) return;

    // Fetch up to 2 products to link in related products
    const sampleProducts = await Product.find({}).limit(2).lean() as any[];
    const productIds = sampleProducts.map(p => p._id);

    const seedPosts = [
        {
            title: "The Ultimate Guide to Selecting Premium Attars: Oud vs Floral",
            slug: "ultimate-guide-attars-oud-vs-floral",
            summary: "Struggling to choose between the deep, mystical allure of Oud and the fresh, elegant notes of floral attars? Discover the cultural history, scent profiles, and ideal occasions for each signature class.",
            featuredImage: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=800",
            content: `Choosing the perfect fragrance is a deeply personal journey, especially when navigating the rich, artisanal world of **Attars (Concentrated Perfume Oils)**. Traditional eastern perfumery generally divides these precious elixirs into two magnificent families: **Oud (Woody/Spicy)** and **Floral (Jasmine, Rose, Lotus)**.

In this comprehensive buying guide, we explore the origins, profiles, and distinct traits of both Oud and Floral attars, helping you discover your next signature scent at **Salaf**.

---

## The Majesty of Oud Attar

**Oud**, often referred to as "Liquid Gold," is distilled from the resinous heartwood of the Aquilaria tree. It is one of the most expensive and revered raw materials in the fragrance industry.

### The Olfactory Profile of Oud
- **Top Notes**: Warm spice, faint leather, saffron.
- **Heart Notes**: Rich woodiness, sweet amber, balsamic depth.
- **Base Notes**: Deep, earthy agarwood, animalic warmth, smoke.

### Best Suited For
Oud attars are intense, warm, and highly sophisticated. They are ideal for:
1. **Occasions**: Formal evening galas, traditional celebrations, and high-profile gatherings.
2. **Seasons**: Cooler autumn evenings and winter months, where the cold air enhances the warm, cozy sillage of wood and amber.
3. **Longevity**: Unmatched. Pure Oud oils can comfortably last up to 24-48 hours on skin and fabrics.

---

## The Elegance of Floral Attars

In stark contrast to the dark, resinous depth of Oud, **Floral Attars** capture the ethereal, fresh beauty of delicate blossoms. Using ancient hydro-distillation methods (Degh & Bhapka), perfumers capture the pure essence of delicate petals.

### Popular Floral Essential Accords
- **Jasmine (Motia/Yasmin)**: Sweet, intoxicating, and vibrant.
- **Rose (Gulab)**: Classic, dewy-fresh, deeply romantic, and comforting.
- **Kevala & Vetiver (Khus)**: Earthy, green-floral, and remarkably cooling in high heat.

### Best Suited For
Floral attars evoke a sense of light, purity, and immediate grace.
1. **Occasions**: Daily daytime wear, casual outings, office settings, and spiritual prayer times.
2. **Seasons**: Spring and hot summer days, where the light, blooming notes feel incredibly refreshing and uplifting.
3. **Longevity**: Highly refreshing, typically lasting 6 to 12 hours.

---

## Oud vs Floral: The Verdict

| Fragrance Feature | Oud Attars | Floral Attars |
|---|---|---|
| **Primary Vibe** | Mysterious, opulent, warm | Light, clean, pure, refreshing |
| **Scent Longevity** | Extremely high (12-24+ hours) | High (6-12 hours) |
| **Occasion** | Formal evening events | Daily wear & daytime outings |
| **Gender Preference** | Boldly Unisex / Masc Leaning | Cleanly Unisex / Fem Leaning |

Ultimately, a balanced fragrance collection has room for both. Consider layering a light Floral attar on top of an Oud base to craft an incredibly unique, customized signature scent that offers both fresh projection and woodsy depth!`,
            author: {
                name: "Farhan Sadiq",
                image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
                bio: "Fragrance curator and lead designer at Salaf, dedicated to reviving traditional eastern perfumery.",
                twitter: "@farhansadiq"
            },
            type: "buying-guide",
            tags: ["Attar", "Oud", "Floral", "Buying Guide", "Perfume"],
            faqs: [
                {
                    question: "How long does a pure Oud attar typically last?",
                    answer: "A high-quality pure Oud attar has an exceptionally high oil concentration and can easily last 12 to 24 hours on the skin, and sometimes several days on clothes."
                },
                {
                    question: "Can I blend or layer Oud and Floral attars together?",
                    answer: "Absolutely! Layering a sweet, fresh floral attar (like Rose or Jasmine) over a deep woody Oud base creates a stunning, highly customized fragrance profile that is both warm and fresh."
                }
            ],
            relatedProducts: productIds,
            status: "published",
            publishedAt: new Date()
        },
        {
            title: "Deep Oud vs Fresh Jasmine: Which Signature Scent is Right for You?",
            slug: "deep-oud-vs-fresh-jasmine-comparison",
            summary: "A head-to-head sensory comparison between two of the most prestigious fragrance profiles in Eastern perfumery. Read our expert analysis on projection, longevity, and aesthetics.",
            featuredImage: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
            content: `In the premium world of luxury scents, two names stand above all others as the ultimate symbols of olfactory prestige: **Deep Oud** and **Fresh Jasmine**. These two notes represent two entirely different philosophy directions of Eastern fragrance artistry.

If you are looking to purchase your next masterpiece at **Salaf**, this detailed sensory comparison will break down exactly how these two profiles compare in performance, projection, and daily wear.

---

## 1. Deep Oud: The Mystical Liquid Gold

**Oud** is a complex, rich, resinous note derived from infected agarwood trees. It has a heavy, warm, and highly sophisticated vibe.

- **Olfactory Profile**: Warm woody, leather, spice, and dark amber.
- **Sillage (Scent Cloud)**: Heavy and intimate. It leaves a memorable, rich trail behind you.
- **Emotional Vibe**: Opulent, mysterious, royal, and grounding.
- **Best Wear Time**: Evening, formal dinner events, winter, and cold seasons.

---

## 2. Fresh Jasmine: The Intoxicating Royal Bloom

**Jasmine** (Motia/Yasmin) is the queen of floral notes in the East. Harvested during the early dawn hours, its oil holds a sweet, intoxicating green floral freshness.

- **Olfactory Profile**: Intense white floral, sweet nectar, honeyed undertones, and green freshness.
- **Sillage (Scent Cloud)**: Bright and highly diffusive. It projects strongly, capturing immediate attention in the air.
- **Emotional Vibe**: Pure, uplifting, clean, romantic, and energetic.
- **Best Wear Time**: Daytime, casual morning events, spring, and hot summer seasons.

---

## Direct Head-to-Head Comparison

### Longevity & Performance
- **Oud**: Highly concentrated. It clings to skin cells and fabric fibers, easily outlasting 16+ hours.
- **Jasmine**: Highly volatile and aromatic. It projects incredibly well initially and settles into a beautiful, close skin-scent that lasts around 6-10 hours.

### Occasion Adaptability
- **Oud**: Best reserved for special occasions, formal settings, business meetings, and nighttime.
- **Jasmine**: Exceptionally versatile. Ideal for daily work, morning prayers, casual brunch, or refreshing yourself during a warm afternoon.

### Sensory Vibe
- Choose **Deep Oud** if you want to project mysterious power, timeless tradition, and sophisticated warmth.
- Choose **Fresh Jasmine** if you prefer to feel clean, fresh, incredibly radiant, and approachable.

---

## Pro Tip: The Art of Layering

Instead of choosing one, did you know they blend beautifully? Apply a single drop of **Deep Oud** to your wrists, let it settle for 5 minutes, and then dab a touch of **Fresh Jasmine** on top. The sweet, white-floral projection of Jasmine cuts beautifully through the smoky resin of the Oud, creating a majestic contrast that projects pure luxury.`,
            author: {
                name: "Farhan Sadiq",
                image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
                bio: "Fragrance curator and lead designer at Salaf, dedicated to reviving traditional eastern perfumery.",
                twitter: "@farhansadiq"
            },
            type: "product-comparison",
            tags: ["Oud", "Jasmine", "Comparison", "Perfume", "Attar"],
            faqs: [
                {
                    question: "Which of the two has a stronger initial scent cloud?",
                    answer: "Jasmine projects much more aggressively at first due to its volatile botanical structure. However, Oud will last far longer on the skin as it dries down."
                },
                {
                    question: "Is Jasmine attar suitable for men?",
                    answer: "Absolutely! Traditional Eastern perfumery is beautifully unisex. When applied on masculine skin, Jasmine takes on a rugged, honey-warm floral tone that is highly unique and clean."
                }
            ],
            relatedProducts: productIds,
            status: "published",
            publishedAt: new Date()
        },
        {
            title: "How to Apply and Layer Attars for 24-Hour Longevity",
            slug: "how-to-apply-layer-attars-longevity",
            summary: "Unlock the secrets of traditional scent layering. Learn the key pulse points, skin preparation tricks, and layering rules to ensure your artisanal attar oil remains radiant all day.",
            featuredImage: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800",
            content: `Have you ever applied a luxury **Attar (Concentrated Perfume Oil)** only to find its projection fade after a few hours? Unlike standard alcohol-based spray perfumes, attar oils are natural, thick, and react dynamically with your skin's temperature.

In this practical, step-by-step masterclass, our senior perfumers at **Salaf** share their secrets on **how to apply and layer attars** to achieve a radiant scent trail that easily lasts 24 hours.

---

## Step 1: Prep Your Canvas (Skin Hydration)

Attar oils require moisture to bind successfully to your skin. Dry skin absorbs the fragrance oil too quickly, muting the dry down.

- **The Trick**: Apply fragrance immediately after a warm shower when your pores are fully open.
- **The Secret**: Apply a tiny dab of **unscented moisturizer or pure petroleum jelly (Vaseline)** to your pulse points before applying the oil. The cream acts as an anchor, sealing the fragrance molecules on top of the skin.

---

## Step 2: Target Key Pulse Points

Pulse points are areas where blood vessels run closest to the skin's surface, producing gentle, continuous heat. This heat warms the oil, steadily releasing the scent notes into the surrounding air.

### The Essential Attar Pulse Points
1. **The Wrists**: The most common point. Dab, but **NEVER rub your wrists together**. Rubbing creates friction heat, which breaks down the delicate top notes of the oil, altering the scent progression.
2. **Behind the Earlobes**: Highly intimate and perfect for leaving a beautiful scent trail as you move or greet others.
3. **The Collarbones**: Warm, steady heat that rises directly to your own nose and those nearby.
4. **Inside the Elbows**: A hidden pulse point that projects beautifully as you move your arms throughout the day.

---

## Step 3: Proper Application Technique

Avoid rubbing the applicator stick directly on your clothes as it may stain premium fabrics.

- **The Correct Method**: 
  1. Take the glass applicator stick from your **Salaf** bottle.
  2. Dab a small drop of oil onto one of your inner wrists.
  3. Gently tap your wrists together to share the oil (no rubbing!).
  4. Tap the wrists behind your earlobes and onto your collarbones.
  5. Gently run your palms over the sides of your clothes/beard to distribute any microscopic remainder.

---

## Step 4: The Golden Rules of Fragrance Layering

Scent layering is the majestic art of blending two or more fragrances to create a completely unique signature profile.

### Rule 1: Heavy First, Light Second
Always apply the heaviest, most resinous attar first (such as **Oud, Amber, or Patchouli**). Let it settle for 3 to 5 minutes to form the warm base foundation. Then, apply the lighter, fresher notes (like **Rose, Jasmine, or Citrus**) on top.

### Rule 2: Attar Oil + Spray Perfume Combo
For the ultimate performance:
1. Apply your concentrated **Salaf Attar Oil** to your pulse points.
2. Spray a matching **Salaf Spray Perfume** over your neck and shoulders.
The spray perfume provides immediate, massive projection in the air, while the attar oil base guarantees an everlasting, rich longevity that anchors the spray for the rest of the day.

---

## Summary Routine for 24-Hour Projection

1. **Shower**: Cleanse and open your skin pores.
2. **Moisturize**: Apply unscented lotion to the wrists and neck.
3. **Base Oil**: Tap a rich Oud or Woody Attar onto pulse points.
4. **Top Accent**: Dab a fresh Jasmine or Rose Attar on top.
5. **Diffusion**: Spritz a standard spray perfume onto your clothes.
6. **Rule of Thumb**: Tap, don't rub, to keep the scent structure whole!`,
            author: {
                name: "Aisha Rahman",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
                bio: "Senior perfumer and layering specialist at Salaf with over 15 years of olfactory blending expertise.",
                twitter: "@aisharperfumes"
            },
            type: "tutorial",
            tags: ["Layering", "Longevity", "Tutorial", "Attar Application", "Perfume"],
            faqs: [
                {
                    question: "Why shouldn't I rub my wrists together after applying attar?",
                    answer: "Rubbing wrists creates friction and excessive heat which breaks down the delicate top-note molecules (like citrus and soft florals) instantly, shortening the scent progression."
                },
                {
                    question: "Will attar oils stain my clothes?",
                    answer: "Because pure attars are oil-based, they can leave marks on delicate light fabrics like silk or fine linen. It is always safest to apply attars to your skin first, and let them dry before dressing."
                }
            ],
            relatedProducts: productIds,
            status: "published",
            publishedAt: new Date()
        }
    ];

    await BlogPost.insertMany(seedPosts);
    console.log("Successfully seeded premium blog posts!");
}

export default async function BlogIndexPage({ searchParams }: BlogPageProps) {
    await dbConnect();
    await seedBlogPostsIfEmpty();

    const { type } = await searchParams;
    const filterType = type && ['buying-guide', 'product-comparison', 'tutorial'].includes(type) ? type : undefined;

    // Fetch published blog posts
    const query: any = { status: 'published', ...(filterType ? { type: filterType } : {}) };
    const posts = await BlogPost.find(query).sort({ publishedAt: -1 }).lean() as any[];

    // Define category filter tabs
    const tabs = [
        { label: "All Scent Diaries", value: "" },
        { label: "Buying Guides", value: "buying-guide" },
        { label: "Product Comparisons", value: "product-comparison" },
        { label: "Tutorials", value: "tutorial" }
    ];

    const currentTab = filterType || "";

    return (
        <main className="min-h-screen bg-background text-foreground pt-4 md:pt-24 pb-20 overflow-x-hidden">
            <div className="container mx-auto px-4 md:px-6">
                
                {/* Accessible Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="mb-6 md:mb-10">
                    <ol className="flex items-center flex-wrap gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                        <li>
                            <a href="/" className="hover:text-foreground transition-colors">Home</a>
                        </li>
                        <li className="flex items-center gap-2">
                            <span aria-hidden="true">/</span>
                            <span className="text-muted-foreground" aria-current="page">Scent Diaries</span>
                        </li>
                    </ol>
                </nav>

                {/* Aesthetic Glassmorphic Blog Header */}
                <header className="relative mb-16 rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#120f0a] via-[#090806] to-[#1a150e] border border-white/5 py-20 px-8 md:px-16 text-center text-white shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1),transparent_70%)] pointer-events-none" />
                    
                    <span className="text-[#d4af37] text-[10px] tracking-[0.3em] uppercase font-bold mb-4 block">
                        THE ART OF SCENT
                    </span>
                    <h1 className="text-4xl md:text-6xl font-heading font-medium tracking-wider mb-6 leading-tight drop-shadow-md">
                        Scent Diaries
                    </h1>
                    
                    <p className="max-w-2xl mx-auto text-white/80 text-sm md:text-base font-light leading-relaxed mb-4">
                        Discover perfume wisdom, layering masterclasses, buying guides, and deep-dives into traditional ingredients like Oud, Amber & Jasmine.
                    </p>
                    
                    <div className="w-16 h-[2px] bg-[#d4af37]/60 mx-auto mt-6 rounded-full" />
                </header>

                {/* Filter Navigation Tabs - Crawlable, SEO-Friendly anchors */}
                <nav aria-label="Article Categories" className="flex justify-center items-center gap-3 sm:gap-4 mb-16 flex-wrap">
                    {tabs.map((tab) => (
                        <a
                            key={tab.value}
                            href={tab.value ? `/blog?type=${tab.value}` : '/blog'}
                            className={`px-4 sm:px-6 py-2.5 rounded-full border text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                                currentTab === tab.value
                                    ? "border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5 shadow-sm"
                                    : "border-border text-muted-foreground hover:border-[#d4af37]/40 hover:text-foreground"
                            }`}
                        >
                            {tab.label}
                        </a>
                    ))}
                </nav>

                {/* Blog Card Grid */}
                {posts.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground text-sm tracking-wider uppercase font-bold">
                        No articles found. Check back soon!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {posts.map((post) => (
                            <article
                                key={post._id}
                                className="group bg-card border border-border/40 rounded-3xl overflow-hidden hover:border-[#d4af37]/30 hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
                            >
                                {/* Next/Image with descriptive Alt text & descriptive filename */}
                                <div className="relative aspect-video w-full overflow-hidden bg-black/20">
                                    <Image
                                        src={post.featuredImage}
                                        alt={`Cover image for: ${post.title}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        loading="lazy"
                                    />
                                    {/* Type badge */}
                                    <span className="absolute top-4 left-4 bg-background/90 backdrop-blur-md text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest text-[#d4af37] px-3 py-1 rounded-full border border-white/5">
                                        {post.type.replace('-', ' ')}
                                    </span>
                                </div>

                                {/* Content Details */}
                                <div className="p-6 md:p-8 flex flex-col flex-1">
                                    {/* Metadata header */}
                                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-[#d4af37]/70" />
                                            <span>
                                                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5 text-[#d4af37]/70" />
                                            <span>{post.author.name}</span>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-xl md:text-2xl font-heading font-medium tracking-wide text-foreground group-hover:text-[#d4af37] transition-colors mb-4 line-clamp-2 leading-snug">
                                        <Link href={`/blog/${post.slug}`} className="focus:outline-none">
                                            {post.title}
                                        </Link>
                                    </h2>

                                    {/* Summary */}
                                    <p className="text-muted-foreground text-xs md:text-sm font-light leading-relaxed mb-6 line-clamp-3">
                                        {post.summary}
                                    </p>

                                    {/* Action link */}
                                    <div className="mt-auto pt-4 border-t border-border/30 flex items-center justify-between">
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#d4af37] group-hover:text-foreground transition-colors focus:outline-none"
                                            aria-label={`Read full article: ${post.title}`}
                                        >
                                            <span>Read Article</span>
                                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground/60 font-semibold tracking-wider">
                                            <Clock className="w-3 h-3" />
                                            <span>6 min read</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
