import mongoose, { Schema, Model } from 'mongoose';

import { IDeliveryZoneDocument } from '@/types/models.types';

/**
 * Mongoose schema for the DeliveryZone model.
 * 
 * Defines geographical delivery areas (division, district, upazila) and their
 * associated delivery fees and free shipping thresholds.
 */
const deliveryZoneSchema = new Schema<IDeliveryZoneDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        division: {
            type: String,
            trim: true,
        },
        district: {
            type: String,
            trim: true,
        },
        upazila: {
            type: String,
            trim: true,
        },
        deliveryFee: {
            type: Number,
            required: true,
            min: 0,
        },
        freeDeliveryThreshold: {
            type: Number,
            min: 0,
        },
        priority: {
            type: Number,
            default: 0,
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
 * The DeliveryZone model for interacting with the 'delivery_zones' collection in MongoDB.
 * 
 * Includes a compound index on `division`, `district`, `upazila`, and `priority` 
 * for optimized area-based lookups and fee matching.
 */
export const DeliveryZone: Model<IDeliveryZoneDocument> =
  mongoose.models?.DeliveryZone ||
  mongoose.model<IDeliveryZoneDocument>("DeliveryZone", deliveryZoneSchema)

export default DeliveryZone
