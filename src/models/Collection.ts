import mongoose, { Schema, Model } from 'mongoose';

import { ICollectionDocument } from '@/types/models.types';

/**
 * Mongoose schema for the Collection model.
 * 
 * Represents a group of products (e.g., "Summer Essentials", "Limited Edition").
 * Used for organizing products on the storefront and in the CMS.
 */
const collectionSchema = new Schema<ICollectionDocument>(
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
            default: '',
        },
        imageUrl: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

/**
 * The Collection model for interacting with the 'collections' collection in MongoDB.
 */
export const Collection: Model<ICollectionDocument> =
  mongoose.models?.Collection ||
  mongoose.model<ICollectionDocument>("Collection", collectionSchema)

export default Collection
