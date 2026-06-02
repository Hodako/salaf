import { NextResponse } from "next/server";
import { dbConnect } from "@/helpers";
import { Review, ExternalReview, Product } from "@/models";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const productId = searchParams.get("productId");

        await dbConnect();
        
        let reviewQuery: any = { isApproved: true };
        let extReviewQuery: any = { isApproved: true };

        // Ensure Product model is initialized for populate
        if (!Product) {
             throw new Error("Product model not found");
        }

        if (productId) {
            reviewQuery.product = productId;
            extReviewQuery.product = productId;
        }

        const startIndex = (page - 1) * limit;
        const dbLimit = startIndex + limit;

        console.time("[DB Telemetry] Storefront Reviews Query");
        const [reviews, extReviews, totalReviews, totalExtReviews] = await Promise.all([
            Review.find(reviewQuery)
                .sort({ createdAt: -1 })
                .limit(dbLimit)
                .populate("product", "_id name slug images featuredImage")
                .lean(),
            ExternalReview.find(extReviewQuery)
                .sort({ createdAt: -1 })
                .limit(dbLimit)
                .populate("product", "_id name slug images featuredImage")
                .lean(),
            Review.countDocuments(reviewQuery),
            ExternalReview.countDocuments(extReviewQuery)
        ]);
        console.timeEnd("[DB Telemetry] Storefront Reviews Query");

        const normalizedReviews = [];

        for (const rev of reviews as any[]) {
            normalizedReviews.push({
                id: rev._id.toString(),
                type: 'internal',
                reviewerName: rev.user || "Anonymous",
                content: rev.comment || "",
                rating: rev.rating,
                images: rev.images || [],
                date: rev.createdAt || new Date(),
                product: rev.product ? {
                    id: rev.product._id.toString(),
                    name: rev.product.name,
                    slug: rev.product.slug,
                    image: rev.product.featuredImage || rev.product.images?.[0]
                } : undefined,
                link: rev.product ? `/shop/${rev.product.slug}#reviews` : '#'
            });
        }

        for (const ext of extReviews as any[]) {
            normalizedReviews.push({
                id: ext._id.toString(),
                type: 'external',
                reviewerName: ext.reviewerName,
                content: ext.content,
                rating: ext.rating,
                images: ext.images || [],
                source: ext.source,
                date: ext.date || ext.createdAt || new Date(),
                product: ext.product ? {
                    id: ext.product._id.toString(),
                    name: ext.product.name,
                    slug: ext.product.slug,
                    image: ext.product.featuredImage || ext.product.images?.[0]
                } : undefined,
                link: ext.link || (ext.product ? `/shop/${ext.product.slug}` : '#')
            });
        }

        // Sort by date DESC
        normalizedReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const totalItems = normalizedReviews.length;
        const endIndex = startIndex + limit;
        const paginatedReviews = normalizedReviews.slice(startIndex, endIndex);

        return NextResponse.json({
            reviews: paginatedReviews,
            totalCount: totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page
        });

    } catch (error: any) {
        console.error("Failed to fetch all reviews:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}
