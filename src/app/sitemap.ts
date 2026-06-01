import { MetadataRoute } from 'next';
import { dbConnect } from "@/helpers";
import { Product, Page, Collection, Brand, Category, BlogPost } from "@/models";


const DOMAIN = 'https://salaf.bd';

/**
 * Generates a dynamic sitemap for Salaf.
 * Includes static routes, products, brands, collections, and CMS pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await dbConnect();

    // 1. Core Static Routes
    const staticRoutes = [
      '',
      '/shop',
    ].map((route) => ({
      url: `${DOMAIN}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    }));

    // 2. Dynamic Product Routes
    const products = await Product.find({}).select('slug updatedAt').lean() as any[];
    const productEntries = products.map((p) => ({
      url: `${DOMAIN}/product/${p.slug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // 3. Dynamic Brand Routes
    const brands = await Brand.find({}).select('slug updatedAt').lean() as any[];
    const brandEntries = brands.map((b) => ({
      url: `${DOMAIN}/brands/${b.slug}`,
      lastModified: b.updatedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

    // 4. Dynamic Collection Routes
    const collections = await Collection.find({}).select('slug updatedAt').lean() as any[];
    const collectionEntries = collections.map((c) => ({
      url: `${DOMAIN}/collections/${c.slug}`,
      lastModified: c.updatedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

    // 5. Dynamic CMS Page Routes (Custom pages built in the dashboard)
    const pages = await Page.find({ type: 'page', status: 'published' }).select('slug updatedAt').lean() as any[];
    const pageEntries = pages
      .filter((p) => !['shop', 'checkout', 'product'].includes(p.slug)) // Exclude reserved slugs
      .map((p) => ({
        url: `${DOMAIN}/${p.slug}`,
        lastModified: p.updatedAt || new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));

    // 6. Dynamic Category Routes
    const categories = await Category.find({ isActive: true }).select('slug updatedAt').lean() as any[];
    const categoryEntries = categories.map((cat: any) => ({
        url: `${DOMAIN}/category/${cat.slug}`,
        lastModified: cat.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // 7. Dynamic Blog Routes
    const blogPosts = await BlogPost.find({ status: 'published' }).select('slug updatedAt').lean() as any[];
    const blogEntries = blogPosts.map((post: any) => ({
        url: `${DOMAIN}/blog/${post.slug}`,
        lastModified: post.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    const blogIndexEntry = {
        url: `${DOMAIN}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    };

    return [
      ...staticRoutes,
      ...productEntries,
      ...brandEntries,
      ...collectionEntries,
      ...pageEntries,
      ...categoryEntries,
      blogIndexEntry,
      ...blogEntries
    ];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    // Fallback to static routes if database fails
    return [
      {
        url: DOMAIN,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      }
    ];
  }
}
