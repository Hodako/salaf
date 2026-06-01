import mongoose, { Schema, Model } from 'mongoose';
import { IBrandDocument } from '@/types/models.types';

const brandSchema = new Schema<IBrandDocument>(
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
        logo: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

export const Brand: Model<IBrandDocument> =
    mongoose.models?.Brand ||
    mongoose.model<IBrandDocument>("Brand", brandSchema)

export default Brand
