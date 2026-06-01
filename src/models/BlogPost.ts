import mongoose, { Schema, Model } from 'mongoose';
import { IBlogPostDocument } from '@/types/models.types';

const faqSchema = new Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true }
}, { _id: false });

const authorSchema = new Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    bio: { type: String },
    twitter: { type: String }
}, { _id: false });

const blogPostSchema = new Schema<IBlogPostDocument>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        content: {
            type: String,
            required: true,
        },
        summary: {
            type: String,
            required: true,
            trim: true,
        },
        featuredImage: {
            type: String,
            required: true,
        },
        author: {
            type: authorSchema,
            required: true,
        },
        type: {
            type: String,
            enum: ['buying-guide', 'product-comparison', 'tutorial', 'general'],
            default: 'general',
            index: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        faqs: {
            type: [faqSchema],
            default: [],
        },
        relatedProducts: [{
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }],
        status: {
            type: String,
            enum: ['draft', 'published'],
            default: 'draft',
            index: true,
        },
        publishedAt: {
            type: Date,
            default: Date.now,
        }
    },
    {
        timestamps: true,
    }
);

export const BlogPost: Model<IBlogPostDocument> =
    mongoose.models?.BlogPost ||
    mongoose.model<IBlogPostDocument>("BlogPost", blogPostSchema);

export default BlogPost;
