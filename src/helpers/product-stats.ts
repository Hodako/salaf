import Review from "@/models/Review";
import ExternalReview from "@/models/ExternalReview";
import mongoose from "mongoose";

export async function getReviewStats(productId: string | mongoose.Types.ObjectId) {
  const pId = typeof productId === 'string' ? new mongoose.Types.ObjectId(productId) : productId;

  const [internalStats, externalStats] = await Promise.all([
    Review.aggregate([
      { $match: { product: pId, isApproved: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $count: {} }
        }
      }
    ]),
    ExternalReview.aggregate([
      { $match: { product: pId, isApproved: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $count: {} }
        }
      }
    ])
  ]);

  const internal = internalStats[0] || { avgRating: 0, totalReviews: 0 };
  const external = externalStats[0] || { avgRating: 0, totalReviews: 0 };

  const totalReviews = internal.totalReviews + external.totalReviews;
  const avgRating = totalReviews > 0
    ? (internal.avgRating * internal.totalReviews + external.avgRating * external.totalReviews) / totalReviews
    : 0;

  return {
    avgRating,
    totalReviews
  };
}
