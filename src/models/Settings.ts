import mongoose, { Schema, Model } from 'mongoose';

import { ISettingsDocument } from '@/types/models.types';

/**
 * Mongoose schema for the Settings model.
 * 
 * Stores generic application configuration as key-value pairs.
 * The `value` field is mixed to support various data types.
 */
const settingsSchema = new Schema<ISettingsDocument>({
    key: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    value: {
        type: Schema.Types.Mixed,
        required: true,
    },
}, { timestamps: true });

/**
 * The Settings model for interacting with the 'settings' collection in MongoDB.
 */
export const Settings: Model<ISettingsDocument> =
  mongoose.models?.Settings ||
  mongoose.model<ISettingsDocument>("Settings", settingsSchema)

export default Settings
