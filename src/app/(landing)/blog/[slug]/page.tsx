import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { dbConnect } from "@/helpers";
import { BlogPost, Product } from "@/models";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";
import { ProductCard } from "@/components/home/ProductCard";
import { Calendar, User, Clock, ArrowLeft, Facebook, Twitter, Link as LinkIcon } from "lucide-react";

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;
    await dbConnect();
    const post = await BlogPost.findOne({ slug, status: 'published' }).lean() as any;

    if (!post) return { title: 'Article Not Found | Salaf - سلف' };

    const title = `${post.title} | Scent Diaries | Salaf`;
    const description = post.summary || `Read our expert fragrance article about ${post.title} on Salaf Scent Diaries.`;

    return {
        title,
        description,
        alternates: {
            canonical: `https://salaf.bd/blog/${post.slug}`,
        },
        openGraph: {
            title,
            description,
            type: 'article',
            url: `https://salaf.bd/blog/${post.slug}`,
            publishedTime: post.publishedAt?.toISOString() || post.createdAt?.toISOString(),
            modifiedTime: post.updatedAt?.toISOString(),
            authors: [post.author.name],
            images: [{ url: post.featuredImage, alt: post.title }],
            siteName: "Salaf - سلف",
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [post.featuredImage],
        }
    };
}

export default async function BlogPostDetailPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    await dbConnect();

    // 1. Fetch Post details
    const post = await BlogPost.findOne({ slug, status: 'published' }).lean() as any;
    if (!post) return notFound();

    // 2. Fetch Related Products
    const relatedProductsRaw = await Product.find({
        _id: { $in: post.relatedProducts || [] }
    }).limit(3).lean() as any[];

    // 3. Fetch Related Articles
    const relatedArticlesRaw = await BlogPost.find({
        _id: { $ne: post._id },
        type: post.type,
        status: 'published'
    }).limit(2).lean() as any[];

    // 4. Generate Table of Contents from h2 headings in Markdown
    const headingRegex = /^##\s+(.+)$/gm;
    const headings: { title: string; id: string }[] = [];
    let match;
    // Extracting matches from markdown body
    while ((match = headingRegex.exec(post.content)) !== null) {
        const hTitle = match[1].replace(/\*\*/g, ''); // strip bold markers
        const hId = hTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        headings.push({ title: hTitle, id: hId });
    }

    // 5. Generate JSON-LD Rich Snippet Schemas
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": post.title,
        "image": [post.featuredImage],
        "datePublished": post.publishedAt || post.createdAt,
        "dateModified": post.updatedAt || post.createdAt,
        "author": [{
            "@type": "Person",
            "name": post.author.name,
            "url": `https://salaf.bd/blog`
        }],
        "publisher": {
            "@type": "Organization",
            "name": "Salaf - سلف",
            "logo": {
                "@type": "ImageObject",
                "url": "https://salaf.bd/nav-logo.png"
            }
        },
        "description": post.summary
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://salaf.bd" },
            { "@type": "ListItem", "position": 2, "name": "Scent Diaries", "item": "https://salaf.bd/blog" },
            { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://salaf.bd/blog/${post.slug}` }
        ]
    };

    const faqSchema = post.faqs?.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": post.faqs.map((faq: any) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    } : null;

    const pageUrl = `https://salaf.bd/blog/${post.slug}`;

    return (
        <main className="min-h-screen bg-background text-foreground pt-4 md:pt-24 pb-20 overflow-x-hidden relative">
            {/* Interactive scroll progress bar */}
            <ReadingProgressBar />

            {/* Structured Schema JSON-LD Injection */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}

            <div className="container mx-auto px-4 md:px-6">
                
                {/* Accessible Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="mb-6 md:mb-10">
                    <ol className="flex items-center flex-wrap gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                        <li>
                            <a href="/" className="hover:text-foreground transition-colors">Home</a>
                        </li>
                        <li className="flex items-center gap-2">
                            <span aria-hidden="true">/</span>
                            <a href="/blog" className="hover:text-foreground transition-colors">Scent Diaries</a>
                        </li>
                        <li className="flex items-center gap-2">
                            <span aria-hidden="true">/</span>
                            <span className="text-muted-foreground" aria-current="page">{post.title}</span>
                        </li>
                    </ol>
                </nav>

                {/* Back button */}
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#d4af37] hover:text-foreground transition-colors mb-8 focus:outline-none"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Scent Diaries</span>
                </Link>

                {/* Article Header */}
                <header className="max-w-4xl mx-auto text-center mb-12">
                    <span className="text-[#d4af37] text-[10px] tracking-[0.3em] uppercase font-extrabold mb-4 block">
                        {post.type.replace('-', ' ')}
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-medium tracking-wide text-foreground mb-6 leading-tight">
                        {post.title}
                    </h1>

                    {/* Metadata */}
                    <div className="flex items-center justify-center gap-6 text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest mb-8">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#d4af37]/70" />
                            <span>
                                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#d4af37]/70" />
                            <span>{post.author.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#d4af37]/70" />
                            <span>6 min read</span>
                        </div>
                    </div>
                </header>

                {/* Featured Hero Image */}
                <div className="relative aspect-video max-w-5xl mx-auto rounded-[2rem] overflow-hidden border border-border/30 mb-16 shadow-2xl bg-black/20">
                    <Image
                        src={post.featuredImage}
                        alt={`Featured image for: ${post.title}`}
                        fill
                        sizes="(max-width: 1200px) 100vw, 1200px"
                        priority
                        className="object-cover"
                    />
                </div>

                {/* Main Article Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
                    
                    {/* Left Sticky Sidebar (Table of Contents & Share Buttons) */}
                    <aside className="lg:col-span-3 hidden lg:block lg:sticky lg:top-28 lg:h-fit space-y-8">
                        
                        {/* Table of Contents */}
                        {headings.length > 0 && (
                            <nav aria-label="Table of Contents" className="bg-muted/10 border border-border/40 rounded-2xl p-6">
                                <h3 className="text-xs uppercase font-bold tracking-widest text-foreground mb-4 border-b border-border/30 pb-2">
                                    Table of Contents
                                </h3>
                                <ul className="space-y-3 text-xs">
                                    {headings.map((heading) => (
                                        <li key={heading.id}>
                                            <a
                                                href={`#${heading.id}`}
                                                className="block text-muted-foreground hover:text-[#d4af37] transition-all font-light leading-snug cursor-pointer border-l border-border/40 pl-3 hover:border-[#d4af37]"
                                            >
                                                {heading.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        )}

                        {/* Social Share Accordion */}
                        <div className="bg-muted/10 border border-border/40 rounded-2xl p-6">
                            <h3 className="text-xs uppercase font-bold tracking-widest text-foreground mb-4 border-b border-border/30 pb-2">
                                Share Scent
                            </h3>
                            <div className="flex gap-4">
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-full border border-border hover:bg-[#d4af37]/10 hover:text-[#d4af37] hover:border-[#d4af37]/20 transition-all text-muted-foreground"
                                    aria-label="Share on Facebook"
                                >
                                    <Facebook className="w-4 h-4" />
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(post.title)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-full border border-border hover:bg-[#d4af37]/10 hover:text-[#d4af37] hover:border-[#d4af37]/20 transition-all text-muted-foreground"
                                    aria-label="Share on Twitter"
                                >
                                    <Twitter className="w-4 h-4" />
                                </a>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(pageUrl);
                                        alert("Link copied to clipboard!");
                                    }}
                                    className="p-2.5 rounded-full border border-border hover:bg-[#d4af37]/10 hover:text-[#d4af37] hover:border-[#d4af37]/20 transition-all text-muted-foreground cursor-pointer"
                                    aria-label="Copy page link"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9">
                        
                        {/* Article Text Rendering */}
                        <article className="prose prose-stone dark:prose-invert max-w-none prose-sm sm:prose-base prose-headings:font-heading prose-headings:font-medium prose-p:font-light prose-p:leading-relaxed prose-a:text-[#d4af37]">
                            <ReactMarkdown
                                components={{
                                    h2: ({ ...props }) => {
                                        const text = props.children ? String(props.children) : '';
                                        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                        return <h2 id={id} className="text-2xl md:text-3xl font-heading font-medium tracking-wide text-foreground mt-12 mb-6 border-b border-border/30 pb-3" {...props} />;
                                    },
                                    h3: ({ ...props }) => {
                                        return <h3 className="text-xl font-medium tracking-wide text-foreground mt-8 mb-4 font-heading" {...props} />;
                                    },
                                    p: ({ ...props }) => <p className="text-sm md:text-base text-muted-foreground/90 font-light leading-relaxed mb-6" {...props} />,
                                    li: ({ ...props }) => <li className="text-sm md:text-base text-muted-foreground/90 font-light leading-relaxed mb-2" {...props} />,
                                    ul: ({ ...props }) => <ul className="list-disc pl-6 mb-6 text-[#d4af37]/60" {...props} />,
                                    ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-6 text-[#d4af37]/60" {...props} />,
                                    blockquote: ({ ...props }) => <blockquote className="border-l-4 border-[#d4af37] pl-6 italic my-8 text-muted-foreground bg-muted/5 py-3 rounded-r-xl" {...props} />,
                                    a: ({ ...props }) => <a className="text-[#d4af37] underline hover:text-foreground transition-colors font-medium" {...props} />,
                                    table: ({ ...props }) => <table className="w-full text-left border-collapse border border-border/40 my-8 rounded-2xl overflow-hidden text-xs md:text-sm shadow-sm" {...props} />,
                                    th: ({ ...props }) => <th className="bg-muted/10 p-3 font-bold border-b border-border/40 text-foreground" {...props} />,
                                    td: ({ ...props }) => <td className="p-3 border-b border-border/20 text-muted-foreground font-light" {...props} />,
                                }}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </article>

                        {/* Author Metadata Card */}
                        <section aria-label="About the author" className="mt-16 border-t border-border/40 pt-12">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-muted/10 border border-border/30 rounded-3xl p-6 md:p-8">
                                <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 bg-black/10 border border-[#d4af37]/20">
                                    <Image
                                        src={post.author.image}
                                        alt={post.author.name}
                                        fill
                                        sizes="80px"
                                        className="object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="flex-1 text-center sm:text-left space-y-2">
                                    <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider">
                                        WRITTEN BY
                                    </span>
                                    <h4 className="text-lg font-heading font-medium tracking-wide text-foreground">
                                        {post.author.name}
                                    </h4>
                                    <p className="text-muted-foreground text-xs md:text-sm font-light leading-relaxed">
                                        {post.author.bio || `Specialized contributor writing fragrance articles for Salaf Scent Diaries.`}
                                    </p>
                                    {post.author.twitter && (
                                        <a 
                                            href={`https://twitter.com/${post.author.twitter.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block text-[10px] text-[#d4af37] hover:underline font-bold uppercase tracking-widest pt-2"
                                        >
                                            Follow {post.author.twitter}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Accessible Article FAQ Accordion */}
                        {post.faqs && post.faqs.length > 0 && (
                            <section aria-labelledby="blog-faq-heading" className="mt-16 border-t border-border/40 pt-12">
                                <h3 id="blog-faq-heading" className="text-xl md:text-2xl font-heading font-medium tracking-wide text-foreground mb-8 uppercase text-[#d4af37]">
                                    Article FAQ
                                </h3>
                                <div className="space-y-4">
                                    {post.faqs.map((faq: any, idx: number) => (
                                        <details key={idx} className="group bg-muted/5 border border-border/30 rounded-2xl overflow-hidden transition-all duration-300 open:bg-muted/10 open:border-bprimary-dark/20">
                                            <summary className="flex items-center justify-between gap-4 p-5 md:p-6 font-semibold text-xs md:text-sm tracking-wide text-foreground hover:text-[#d4af37] cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
                                                <span>{faq.question}</span>
                                                <span className="text-xs text-muted-foreground/60 transition-transform duration-300 group-open:rotate-180 group-open:text-[#d4af37]" aria-hidden="true">
                                                    ▼
                                                </span>
                                            </summary>
                                            <div className="px-5 md:px-6 pb-6 text-xs md:text-sm font-light text-muted-foreground leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProductsRaw.length > 0 && (
                    <section aria-labelledby="blog-products-heading" className="mt-20 border-t border-border/40 pt-16">
                        <span className="text-[#d4af37] text-[10px] tracking-[0.3em] uppercase font-bold mb-3 block text-center">
                            FEATURED IN DIARIES
                        </span>
                        <h3 id="blog-products-heading" className="text-2xl md:text-4xl font-heading font-medium tracking-wider text-foreground mb-12 text-center uppercase">
                            Shop Featured Scent Profiles
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                            {relatedProductsRaw.map((product) => (
                                <ProductCard 
                                    key={product._id} 
                                    product={product} 
                                    config={{ showPrice: true, showVolume: true, listName: "Blog Post Featured" }} 
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Related Articles Section */}
                {relatedArticlesRaw.length > 0 && (
                    <section aria-labelledby="blog-related-heading" className="mt-20 border-t border-border/40 pt-16">
                        <span className="text-[#d4af37] text-[10px] tracking-[0.3em] uppercase font-bold mb-3 block text-center">
                            DISCOVER MORE DIARIES
                        </span>
                        <h3 id="blog-related-heading" className="text-2xl md:text-4xl font-heading font-medium tracking-wider text-foreground mb-12 text-center uppercase">
                            Related Scent Whispers
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {relatedArticlesRaw.map((article) => (
                                <div
                                    key={article._id}
                                    className="flex gap-4 md:gap-6 items-center p-4 md:p-6 rounded-3xl bg-muted/5 border border-border/30 hover:border-[#d4af37]/20 transition-all duration-300 group"
                                >
                                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 bg-black/20">
                                        <Image
                                            src={article.featuredImage}
                                            alt={article.title}
                                            fill
                                            sizes="(max-width: 768px) 96px, 128px"
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2 min-w-0">
                                        <span className="text-[#d4af37] text-[8px] tracking-widest font-extrabold uppercase block">
                                            {article.type.replace('-', ' ')}
                                        </span>
                                        <h4 className="text-sm sm:text-base font-heading font-medium tracking-wide text-foreground group-hover:text-[#d4af37] transition-colors line-clamp-2 leading-snug">
                                            <Link href={`/blog/${article.slug}`}>
                                                {article.title}
                                            </Link>
                                        </h4>
                                        <p className="text-muted-foreground text-[10px] sm:text-xs font-light line-clamp-2 leading-relaxed hidden sm:block">
                                            {article.summary}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
