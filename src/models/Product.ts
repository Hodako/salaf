import mongoose, { Schema, Model } from 'mongoose';
import { sectionSchema } from './Page';

import { IProductDocument } from '@/types/models.types';

/**
 * Mongoose schema for the Product model.
 * 
 * Defines the structure of products including basic info, SEO metadata, 
 * perfume-specific taxonomy, and variations (volume, price, etc.).
 * Includes integration with the CMS architecture via `detailsSections`.
 */
/**
 * Mongoose schema for the Product model detailing the structure of products.
 * 
 * Includes basic info, SEO metadata, perfume-specific taxonomy, and 
 * variations (volume, price, etc.). Integrated with CMS architecture 
 * via `detailsSections`.
 */
const productSchema = new Schema<IProductDocument>(
    {
        name: {
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
        skuPrefix: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },
        featuredImage: {
            type: String,
            required: true,
        },
        images: {
            type: [String],
            default: []
        },
        tags: [{
            type: Schema.Types.ObjectId,
            ref: 'Tag'
        }],
        collections: [{
            type: Schema.Types.ObjectId,
            ref: 'Collection'
        }],
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            index: true
        },
        subcategory: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            index: true
        },
        subSubcategory: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            index: true
        },
        seoTitle: String,
        seoDescription: String,
        fragranceFamily: String,
        gender: { type: String, enum: ['Unisex', 'Men', 'Women'], default: 'Unisex' },
        occasion: String,
        variations: [{
            volume: { type: String, required: true },
            volumeUnit: { type: String, enum: ['ml', 'l', 'g', 'kg', 'pcs', 'pack', 'box', 'set'], default: 'g' },
            basePrice: { type: Number, required: true, min: 0 },
            salePrice: { type: Number, min: 0 },
            stock: { type: Number, default: 10, min: 0 },
            sku: String,
            image: String,
            variantType: String
        }],
        attributes: [{
            key: { type: String, required: true },
            value: { type: String, required: true }
        }],
        brand: {
            type: Schema.Types.ObjectId,
            ref: 'Brand'
        },
        isOnSale: {
            type: Boolean,
            default: false,
        },
        detailsSections: [sectionSchema],
    },
    {
        timestamps: true,
    }
);

/**
 * The Product model for interacting with the 'products' collection in MongoDB.
 */
export const Product: Model<IProductDocument> =
  mongoose.models?.Product ||
  mongoose.model<IProductDocument>("Product", productSchema)

export default Product
