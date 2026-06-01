import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { dbConnect } from "@/helpers";
import { Product, Page } from "@/models";
import Review from "@/models/Review";
import ExternalReview from "@/models/ExternalReview";
import { ProductView, ProductStory, ReviewSection, RelatedProducts } from "@/components/product";
import { TemplateInjector } from "@/components/blocks/TemplateInjector";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  await dbConnect();
  const { slug } = await params;
  const product = await Product.findOne({ slug }).select('name featuredImage images seoTitle seoDescription description').lean();

  if (!product) return { title: 'Product Not Found - Salaf' };

  const title = (product as any).seoTitle || `${product.name} | Salaf - سلف`;
  const description = (product as any).seoDescription || (product as any).description || `Experience the luxury of ${product.name} by Salaf — سلف. Crafted for beauty and timeless elegance.`;
  const image = (product as any).featuredImage || (product as any).images?.[0] || "/og-image.png";

  return {
    title,
    description,
    alternates: {
      canonical: `https://salaf.bd/product/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      images: [image],
      type: 'website',
      url: `https://salaf.bd/product/${product.slug}`,
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

export default async function ProductPage({ params }: ProductPageProps) {
  await dbConnect();
  const { slug } = await params;

  const product = await Product.findOne({ slug }).populate("collections tags brand").lean();
  if (!product) {
    notFound();
  }

  // Fetch Reviews (Internal & External)
  const [internalReviews, externalReviews] = await Promise.all([
    Review.find({ product: product._id, isApproved: true })
      .populate('userId', 'image name')
      .sort({ createdAt: -1 })
      .lean(),
    ExternalReview.find({ product: product._id, isApproved: true })
      .sort({ date: -1, createdAt: -1 })
      .lean()
  ]);

  // Combine reviews
  const formattedInternal = internalReviews.map((r: any) => ({
    ...r,
    user: r.userId?.name || r.user || 'Anonymous Customer',
    userImage: r.userId?.image,
    type: 'internal'
  }));
  const formattedExternal = externalReviews.map((r: any) => ({
    ...r,
    reviewerName: r.reviewerName,
    user: r.reviewerName,
    rating: r.rating,
    comment: r.content,
    images: r.images?.length > 0 ? r.images : (r.image ? [r.image] : []),
    createdAt: r.date || r.createdAt,
    source: r.source,
    type: 'external'
  }));

  const allReviews = [...formattedInternal, ...formattedExternal].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Recalculate stats for combined reviews
  const totalReviews = allReviews.length;
  const avgRating = totalReviews > 0 
    ? allReviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalReviews 
    : 0;

  const starDistribution = [5, 4, 3, 2, 1].map((star: number) => {
    const count = allReviews.filter((r: any) => Math.round(r.rating) === star).length;
    return {
      star,
      count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0
    };
  });

  // Related Products (Discover More)
  const relatedProductsRaw = await Product.find({
    collections: { $in: product.collections },
    _id: { $ne: product._id }
  }).limit(4).lean();

  // Fetch Custom Product Template if exists
  let template = null;
  try {
    template = await Page.findOne({ type: 'product_template', status: 'published' }).sort({ updatedAt: -1 }).lean() as any;
  } catch (e) {}

  // Sanitize for Client Components (JSON serializable only)
  const productData = JSON.parse(JSON.stringify(product));
  const relatedProductsData = JSON.parse(JSON.stringify(relatedProductsRaw));

  if (template?.html) {
    return (
      <main className="bg-background min-h-screen w-full">
        {template.css && <style dangerouslySetInnerHTML={{ __html: template.css }} />}
        <TemplateInjector html={template.html} productData={productData} />
      </main>
    );
  }

  const productFaqs = [
    {
      question: `How long does the scent of ${product.name} typically last?`,
      answer: `Due to our high concentration of luxury perfume extracts and artisan craftsmanship, ${product.name} provides outstanding longevity, lasting anywhere from 8 to 24 hours depending on skin type, application, and environment.`
    },
    {
      question: `What is the fragrance profile and family of ${product.name}?`,
      answer: `${product.name} belongs to the ${product.fragranceFamily || 'fine artisanal'} fragrance family and is crafted as a ${product.gender || 'Unisex'} profile. It features rich base notes combined with curated top/middle accords for a premium signature scent experience.`
    },
    {
      question: `How should I store my Salaf fragrances to maintain their potency?`,
      answer: `Keep your Salaf bottles in a cool, dark place away from direct sunlight and extreme temperature changes. Storing your perfume in its original premium box helps preserve the precious natural ingredients and keep the notes intact.`
    },
    {
      question: `Are Salaf fragrances alcohol-free concentrated oils?`,
      answer: `Salaf offers a mixed selection of traditional premium oils (Attars) and standard spray perfumes. Our Pure Attars are 100% alcohol-free concentrated perfume oils, whereas our Spray Perfumes contain high-quality cosmetic-grade perfumer's alcohol for standard diffusion.`
    }
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://salaf.bd"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": "https://salaf.bd/shop"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `https://salaf.bd/product/${product.slug}`
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": productFaqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <main className="bg-background min-h-screen text-foreground pt-2 md:pt-8 pb-8">
      {/* Inject JSON-LD Schema scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container mx-auto px-0 md:px-6">
        {/* Semantic and fully accessible Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-2 md:mb-4 px-3 md:px-0">
          <ol className="flex items-center flex-wrap gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
            <li className="flex items-center gap-2">
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              <a href="/shop" className="hover:text-foreground transition-colors">Products</a>
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              <span className="text-muted-foreground" aria-current="page">{product.name}</span>
            </li>
          </ol>
        </nav>

        {/* Primary Info: Gallery + Actions */}
        <ProductView 
          product={productData} 
          reviewStats={{ avgRating, totalReviews }} 
        />

        {/* Secondary Info: Story Sections */}
        <ProductStory sections={productData.detailsSections} />

        {/* Review Section */}
        <ReviewSection 
          productId={productData._id}
          productName={productData.name}
          reviews={JSON.parse(JSON.stringify(allReviews))} 
          stats={{ avgRating, totalReviews, starDistribution }} 
        />

        {/* Accessible FAQ Accordion */}
        <section aria-labelledby="product-faq-heading" className="mt-8 md:mt-12 border-t border-border pt-6 max-w-4xl mx-auto">
          <h2 id="product-faq-heading" className="text-xl md:text-2xl font-heading font-medium tracking-wide text-foreground mb-4 text-center uppercase text-[#AC8717]">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {productFaqs.map((faq, index) => (
              <details key={index} className="group bg-muted/5 border border-border/40 rounded-2xl overflow-hidden transition-all duration-300 open:bg-muted/10 open:border-[#AC8717]/20">
                <summary className="flex items-center justify-between gap-4 p-3 md:p-4 font-semibold text-xs md:text-sm tracking-wide text-foreground hover:text-[#AC8717] cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <span className="text-xs text-muted-foreground/60 transition-transform duration-300 group-open:rotate-180 group-open:text-[#AC8717]" aria-hidden="true">
                    ▼
                  </span>
                </summary>
                <div className="px-3 md:px-4 pb-4 text-xs md:text-sm font-light text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Cross-Sell: Related Products */}
        <RelatedProducts products={relatedProductsData} />
      </div>
    </main>
  );
}
