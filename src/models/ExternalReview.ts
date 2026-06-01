import mongoose, { Schema, Model } from 'mongoose';
import { IExternalReviewDocument } from '@/types/models.types';

const externalReviewSchema = new Schema<IExternalReviewDocument>(
    {
        reviewerName: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            default: 5
        },
        images: {
            type: [String],
            default: []
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: false,
            index: true
        },
        source: {
            type: String,
            enum: ['FACEBOOK', 'GOOGLE', 'INSTAGRAM', 'OTHERS'],
            default: 'FACEBOOK'
        },
        link: {
            type: String,
            trim: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        isApproved: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export const ExternalReview: Model<IExternalReviewDocument> =
  mongoose.models?.ExternalReview || mongoose.model<IExternalReviewDocument>("ExternalReview", externalReviewSchema)

export default ExternalReview;
