import mongoose, { Schema, type Document } from 'mongoose';

export interface IReport extends Document {
  userId: string;
  analysisId: string;
  websiteId?: string;
  reportData: Record<string, any>;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    userId: { type: String, required: true, index: true },
    analysisId: { type: String, required: true },
    websiteId: String,
    reportData: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export const Report = mongoose.model<IReport>('Report', ReportSchema);
