import mongoose, { Schema, Model } from 'mongoose';
import { normalizePhoneNumber } from '@/helpers/phone';

import { IUserDocument } from '@/types/models.types';

/**
 * Mongoose schema for the User model.
 * 
 * Stores user profile information, authentication metadata (firebaseUid),
 * role-based access control (RBAC), and user-specific data like wishlist and addresses.
 * Includes a pre-save hook for phone number normalization.
 */
const userSchema = new Schema<IUserDocument>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
        },
        role: {
            type: String,
            enum: ['customer', 'admin'],
            default: 'customer',
        },
        firebaseUid: {
            type: String,
            required: false,
            unique: true,
            index: true,
            sparse: true,
        },
        wishlist: [{
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }],
        phoneNumber: {
            type: String,
            trim: true,
        },
        address: {
            division: String,
            district: String,
            upazila: String,
            postCode: String,
            streetAddress: String,
        }
    },
    {
        timestamps: true,
    }
);

userSchema.pre('save', async function (this: IUserDocument) {
    if (this.isModified('phoneNumber') && this.phoneNumber) {
        this.phoneNumber = normalizePhoneNumber(this.phoneNumber);
    }
});

/**
 * The User model for interacting with the 'users' collection in MongoDB.
 */
export const User: Model<IUserDocument> =
  mongoose.models?.User || mongoose.model<IUserDocument>("User", userSchema)

export default User
