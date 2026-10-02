import mongoose, { Schema, type Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
