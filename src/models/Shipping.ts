import mongoose, { Schema, Model } from 'mongoose';

import { IShippingDocument } from '@/types/models.types';

/**
 * Mongoose schema for the Shipping model.
 * 
 * Defines shipping methods, their costs, and estimated delivery times.
 */
const shippingSchema = new Schema<IShippingDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        cost: {
            type: Number,
            required: true,
            min: 0,
        },
        estimatedDays: {
            type: String,
            required: true,
        },
        freeShippingThreshold: {
            type: Number,
            min: 0,
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

/**
 * The Shipping model for interacting with the 'shippings' collection in MongoDB.
 */
export const Shipping: Model<IShippingDocument> =
  mongoose.models?.Shipping ||
  mongoose.model<IShippingDocument>("Shipping", shippingSchema)

export default Shipping
