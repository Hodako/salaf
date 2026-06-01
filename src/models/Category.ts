import mongoose, { Schema, Model } from 'mongoose';
import { ICategoryDocument } from '@/types/models.types';

/**
 * Mongoose schema for the Category model.
 * Supports hierarchical nesting: Category -> Subcategory -> Sub-subcategory.
 */
const categorySchema = new Schema<ICategoryDocument>(
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
        description: {
            type: String,
            trim: true,
        },
        imageUrl: {
            type: String,
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            default: null,
            index: true,
        },
        level: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            max: 2,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Category: Model<ICategoryDocument> =
    mongoose.models?.Category ||
    mongoose.model<ICategoryDocument>('Category', categorySchema);

export default Category;
