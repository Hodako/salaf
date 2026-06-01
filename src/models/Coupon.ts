import mongoose, { Schema, Document, Model } from 'mongoose';

import { ICouponDocument } from '@/types/models.types';

/**
 * Mongoose schema for the Coupon model.
 * 
 * Defines discount rules, validity periods, usage limits, and eligibility criteria.
 * Supports both fixed amount and percentage-based discounts.
 */
const couponSchema = new Schema<ICouponDocument>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: {
            type: String,
        },
        discountType: {
            type: String,
            required: true,
            enum: ['percentage', 'fixed_amount'],
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        maxDiscountAmount: {
            type: Number,
            min: 0,
        },
        minimumPurchaseAmount: {
            type: Number,
            min: 0,
        },
        validFrom: {
            type: Date,
            required: true,
            default: Date.now,
        },
        validUntil: {
            type: Date,
            required: true,
        },
        usageLimit: {
            type: Number,
            min: 1
        },
        maxUsesPerUser: {
            type: Number,
            default: 1,
            min: 1
        },
        usedCount: {
            type: Number,
            default: 0,
            min: 0
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
 * The Coupon model for interacting with the 'coupons' collection in MongoDB.
 * 
 * Includes an index to automatically expire or quickly query valid coupons 
 * based on the `validUntil` field.
 */
export const Coupon: Model<ICouponDocument> =
  mongoose.models?.Coupon ||
  mongoose.model<ICouponDocument>("Coupon", couponSchema)

export default Coupon;
