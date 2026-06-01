import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INewsletter extends Document {
  email: string;
  subscribedAt: Date;
}

const NewsletterSchema = new Schema<INewsletter>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  }
});

export const Newsletter: Model<INewsletter> = mongoose.models.Newsletter || mongoose.model<INewsletter>('Newsletter', NewsletterSchema);
