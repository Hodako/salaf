import { NextResponse } from "next/server";
import { dbConnect } from "@/helpers";
import { Product, Category, Collection, Brand } from "@/models";
import { escapeRegExp } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const catSlug = searchParams.get("category");
        const subcatSlug = searchParams.get("subcategory");
        const collectionSlug = searchParams.get("collection");
        const brandSlug = searchParams.get("brand");
        const sort = searchParams.get("sort") || "newest";
        const ids = searchParams.get("ids")?.split(",").filter(Boolean);
        const slugs = searchParams.get("slugs")?.split(",").filter(Boolean);
        
        const query: any = {};
        const q = searchParams.get("q") || searchParams.get("query");

        if (q) {
            const keywords = q.split(/\s+/).filter(Boolean);
            if (keywords.length > 0) {
                const regexPattern = keywords.map(w => escapeRegExp(w)).join("|");
                query.$or = [
                    { name: { $regex: regexPattern, $options: "i" } },
                    { skuPrefix: { $regex: regexPattern, $options: "i" } },
                    { slug: { $regex: regexPattern, $options: "i" } }
                ];
            }
        }

        if (catSlug) {
            if (catSlug.match(/^[0-9a-fA-F]{24}$/)) {
                query.category = catSlug;
            } else {
                const cat = await Category.findOne({ slug: catSlug }).lean();
                if (cat) query.category = cat._id;
            }
        }

        if (subcatSlug) {
            if (subcatSlug.match(/^[0-9a-fA-F]{24}$/)) {
                query.subcategory = subcatSlug;
            } else {
                const subcat = await Category.findOne({ slug: subcatSlug }).lean();
                if (subcat) query.subcategory = subcat._id;
            }
        }

        if (collectionSlug) {
            // First check if it's already an ObjectId
            if (collectionSlug.match(/^[0-9a-fA-F]{24}$/)) {
                query.collections = collectionSlug;
            } else {
                const coll = await Collection.findOne({ slug: collectionSlug }).lean();
                if (coll) query.collections = coll._id;
            }
        }

        if (brandSlug) {
            if (brandSlug.match(/^[0-9a-fA-F]{24}$/)) {
                query.brand = brandSlug;
            } else {
                const brd = await Brand.findOne({ slug: brandSlug }).lean();
                if (brd) query.brand = brd._id;
            }
        }

        if (ids && ids.length > 0) {
            try {
                const mongoose = require('mongoose');
                query._id = { $in: ids.map((id: string) => new mongoose.Types.ObjectId(id)) };
            } catch (e) {
            }
        }

        if (slugs && slugs.length > 0) {
            query.slug = { $in: slugs };
        }

        // Sorting logic
        let sortOption: any = { isOnSale: -1, createdAt: -1 };
        if (sort === "price_asc") sortOption = { "variations.basePrice": 1 };
        if (sort === "price_desc") sortOption = { "variations.basePrice": -1 };
        if (sort === "popularity") sortOption = { rating: -1, reviewCount: -1 };

        const skip = (page - 1) * limit;

        // If searching, use a faster find query instead of aggregation to minimize overhead
        if (q) {
            console.time("[DB Telemetry] Search Products Query");
            const products = await Product.find(query)
                .select("name slug featuredImage images variations isOnSale")
                .sort(sortOption)
                .limit(limit)
                .lean();
            console.timeEnd("[DB Telemetry] Search Products Query");
            
            let didYouMean = null;
            if (products.length === 0) {
                try {
                    // Pull dynamic words from active product names for fuzzy spelling suggestion
                    const allProducts = await Product.find({}).select("name").lean();
                    const allWords = Array.from(new Set(
                        allProducts.flatMap(p => 
                            p.name.toLowerCase()
                                .replace(/[^\w\s]/g, "")
                                .split(/\s+/)
                                .filter((w: string) => w.length > 2)
                        )
                    ));
                    
                    const cleanQ = q.toLowerCase().trim();
                    let minDistance = 999;
                    let bestMatch = null;
                    
                    // Standard Levenshtein spelling distance calculator
                    const getLevDistance = (a: string, b: string): number => {
                        const tmp = [];
                        let i, j;
                        for (i = 0; i <= a.length; i++) tmp[i] = [i];
                        for (j = 0; j <= b.length; j++) tmp[0][j] = j;
                        for (i = 1; i <= a.length; i++) {
                            for (j = 1; j <= b.length; j++) {
                                tmp[i][j] = Math.min(
                                    tmp[i - 1][j] + 1,
                                    tmp[i][j - 1] + 1,
                                    tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
                                );
                            }
                        }
                        return tmp[a.length][b.length];
                    };

                    for (const word of allWords) {
                        const dist = getLevDistance(cleanQ, word);
                        if (dist < minDistance && dist <= 2) {
                            minDistance = dist;
                            bestMatch = word;
                        }
                    }

                    if (bestMatch) {
                        didYouMean = bestMatch.charAt(0).toUpperCase() + bestMatch.slice(1);
                    }
                } catch (e) {
                    console.error("Error calculating didYouMean:", e);
                }
            }
            
            return NextResponse.json({
                products,
                totalPages: 1, // Search results usually don't need full pagination for quick look
                currentPage: 1,
                total: products.length,
                didYouMean
            });
        }

        // Use aggregation to fetch products with review stats for normal shop browsing
        console.time("[DB Telemetry] Normal Shop Browsing Query");
        const [results, total] = await Promise.all([
            Product.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: "reviews",
                        localField: "_id",
                        foreignField: "product",
                        as: "reviews"
                    }
                },
                {
                    $lookup: {
                        from: "externalreviews",
                        localField: "_id",
                        foreignField: "product",
                        as: "externalReviews"
                    }
                },
                {
                    $addFields: {
                        reviewCount: { 
                            $add: [{ $size: "$reviews" }, { $size: "$externalReviews" }] 
                        },
                        rating: { 
                            $cond: {
                                if: { $gt: [{ $add: [{ $size: "$reviews" }, { $size: "$externalReviews" }] }, 0] },
                                then: {
                                    $divide: [
                                        {
                                            $add: [
                                                { $sum: "$reviews.rating" },
                                                { $sum: "$externalReviews.rating" }
                                            ]
                                        },
                                        { $add: [{ $size: "$reviews" }, { $size: "$externalReviews" }] }
                                    ]
                                },
                                else: 0
                            }
                        }
                    }
                },
                {
                    $sort: sortOption
                },
                {
                    $skip: skip
                },
                {
                    $limit: limit
                },
                {
                    $project: {
                        reviews: 0,
                        externalReviews: 0
                    }
                }
            ]),
            Product.countDocuments(query)
        ]);
        console.timeEnd("[DB Telemetry] Normal Shop Browsing Query");

        return NextResponse.json({
            products: results,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
