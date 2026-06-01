import mongoose, { Schema, Model } from 'mongoose';

import { ITagDocument } from '@/types/models.types';

/**
 * Mongoose schema for the Tag model.
 * 
 * Used for categorizing and filtering products on the storefront.
 * Tags are lighter-weight than Collections and primarily used for taxonomy.
 */
const tagSchema = new Schema<ITagDocument>(
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
    },
    { timestamps: true }
);

/**
 * The Tag model for interacting with the 'tags' collection in MongoDB.
 */
export const Tag: Model<ITagDocument> =
  mongoose.models?.Tag || mongoose.model<ITagDocument>("Tag", tagSchema)

export default Tag
