import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotice extends Document {
  content: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  priority: number;
}

const NoticeSchema = new Schema<INotice>({
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  priority: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true
});

export const Notice: Model<INotice> = mongoose.models.Notice || mongoose.model<INotice>('Notice', NoticeSchema);
