import mongoose, { Schema, Model } from 'mongoose';

import { IOrderDocument } from '@/types/models.types';

/**
 * Mongoose schema for the Order model.
 * 
 * Represents a customer's order, containing user reference, list of items,
 * shipping details, pricing breakdown (subtotal, shipping, discount),
 * and status management (order status, payment status).
 */
const orderSchema = new Schema<IOrderDocument>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        items: [
            {
                product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                productName: { type: String, required: true },
                sku: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
                featuredImage: { type: String, required: true },
                volume: { type: String, required: true },
                variantType: { type: String },
            },
        ],
        shippingAddress: {
            division: { type: String, required: true },
            district: { type: String, required: true },
            upazila: { type: String },
            postCode: { type: String },
            streetAddress: { type: String, required: true },
        },
        phoneNumber: { type: String, required: true },
        subtotal: { type: Number, required: true },
        shippingFee: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
        paymentStatus: {
            type: String,
            enum: ['Unpaid', 'Paid'],
            default: 'Unpaid',
        },
        couponCode: {
            type: String,
            uppercase: true,
            trim: true,
        },
        discountAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);


/**
 * The Order model for interacting with the 'orders' collection in MongoDB.
 */
export const Order: Model<IOrderDocument> =
  mongoose.models?.Order || mongoose.model<IOrderDocument>("Order", orderSchema)

export default Order
