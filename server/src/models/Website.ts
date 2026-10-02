import mongoose, { Schema, type Document } from 'mongoose';

export interface IWebsite extends Document {
  userId: string;
  name?: string;
  url: string;
  normalizedUrl: string;
  domain: string;
  favicon?: string;
  latestScore?: number;
  latestStatus?: string;
  lastAnalyzedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteSchema = new Schema<IWebsite>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, default: '' },
    url: { type: String, required: true },
    normalizedUrl: { type: String, required: true },
    domain: { type: String, required: true },
    favicon: String,
    latestScore: Number,
    latestStatus: String,
    lastAnalyzedAt: Date,
  },
  { timestamps: true },
);

export const Website = mongoose.model<IWebsite>('Website', WebsiteSchema);
