import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReviewDocument extends Document {
    product: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    user?: string; // Cache the user name for display
    rating: number; // 1-5
    comment?: string;
    images?: string[]; // Support up to 3 images
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            index: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        user: {
            type: String,
            default: 'Anonymous Customer'
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            trim: true
        },
        images: {
            type: [String],
            validate: [
                (val: string[]) => val.length <= 3,
                'You can only upload up to 3 images per review.'
            ]
        },
        isApproved: {
            type: Boolean,
            default: true // Automatically approved for now per user request context
        }
    },
    { timestamps: true }
);

export const Review: Model<IReviewDocument> = mongoose.models?.Review || mongoose.model<IReviewDocument>('Review', reviewSchema);
export default Review;
