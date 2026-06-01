import mongoose, { Schema, Model } from 'mongoose';

// Sub-schemas for different section types

/**
 * Mongoose sub-schema for page sections.
 * 
 * Defines the structure for various content blocks like hero, featured products,
 * or custom Elementor modular blocks.
 */
export const sectionSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'hero', 'about', 'values', 'featured_products', 'image_gallery', 'video_embed', 'rich_text',
            'heading', 'paragraph', 'banner', 'split_content', 'feature_grid', 'button', 'divider', 'accordion', 'spacer'
        ],
    },
    data: {
        type: Schema.Types.Mixed,
        required: true,
    }
}, { _id: false });

import { IPageDocument } from '@/types';

/**
 * Mongoose schema for the Page model representing a CMS-managed page or template.
 * 
 * Includes SEO metadata, dynamic sections, and optional custom HTML/CSS.
 */
const pageSchema = new Schema<IPageDocument>(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        sections: {
            type: [sectionSchema],
            default: [],
        },
        type: {
            type: String,
            enum: ['page', 'product_template', 'shop_template'],
            default: 'page',
        },
        isHome: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ['draft', 'published'],
            default: 'draft',
        },
        html: {
            type: String,
        },
        css: {
            type: String,
        },
        seo: {
            title: { type: String },
            description: { type: String },
            ogImage: { type: String },
        },
    },
    {
        timestamps: true,
    }
);

/**
 * The Page model for interacting with the 'pages' collection in MongoDB.
 * 
 * Prevents model overwrite in hot-reload Next.js environments.
 */
export const Page: Model<IPageDocument> =
  mongoose.models?.Page || mongoose.model<IPageDocument>("Page", pageSchema)

export default Page

