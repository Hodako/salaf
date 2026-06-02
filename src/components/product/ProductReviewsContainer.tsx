import { dbConnect } from "@/helpers";
import Review from "@/models/Review";
import ExternalReview from "@/models/ExternalReview";
import { ReviewSection } from "./ReviewSection";

interface ProductReviewsContainerProps {
  productId: string;
  productName: string;
}

/**
 * ProductReviewsContainer (RSC Server Component Container)
 * 
 * Progressively fetches internal and external reviews for a specific product,
 * calculates average statistics, formats external data, and renders the 
 * `<ReviewSection>` interactive client component.
 */
export async function ProductReviewsContainer({
  productId,
  productName,
}: ProductReviewsContainerProps) {
  await dbConnect();

  // Parallelized database fetch for internal and external reviews
  const [internalReviews, externalReviews] = await Promise.all([
    Review.find({ product: productId, isApproved: true })
      .populate('userId', 'image name')
      .sort({ createdAt: -1 })
      .lean(),
    ExternalReview.find({ product: productId, isApproved: true })
      .sort({ date: -1, createdAt: -1 })
      .lean()
  ]);

  // Combine and format reviews to match Client Component signatures
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

  // Serialize to pure JSON-serializable payloads for Client hydration
  const reviewsPayload = JSON.parse(JSON.stringify(allReviews));
  const statsPayload = JSON.parse(JSON.stringify({ avgRating, totalReviews, starDistribution }));

  return (
    <ReviewSection 
      productId={productId}
      productName={productName}
      reviews={reviewsPayload} 
      stats={statsPayload} 
    />
  );
}
