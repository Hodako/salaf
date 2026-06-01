import React from "react";
import Review from "@/models/Review";
import ExternalReview from "@/models/ExternalReview";
import { ReviewSection } from "./ReviewSection";
import mongoose from "mongoose";

interface ReviewsWrapperProps {
  productId: string;
  productName: string;
}

export async function ReviewsWrapper({ productId, productName }: ReviewsWrapperProps) {
  const pId = new mongoose.Types.ObjectId(productId);

  const [internalReviews, externalReviews] = await Promise.all([
    Review.find({ product: pId, isApproved: true })
      .populate('userId', 'image name')
      .sort({ createdAt: -1 })
      .lean(),
    ExternalReview.find({ product: pId, isApproved: true })
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

  return (
    <ReviewSection
      productId={productId}
      productName={productName}
      reviews={JSON.parse(JSON.stringify(allReviews))}
      stats={{ avgRating, totalReviews, starDistribution }}
    />
  );
}
