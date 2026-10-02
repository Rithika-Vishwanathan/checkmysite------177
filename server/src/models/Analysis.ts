import mongoose, { Schema, type Document } from 'mongoose';

export interface IAnalysis extends Document {
  userId: string;
  websiteId?: string;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  overallScore: number;
  performance: Record<string, any>;
  seo: Record<string, any>;
  accessibility: Record<string, any>;
  security: Record<string, any>;
  mobile: Record<string, any>;
  technical: Record<string, any>;
  aiSummary?: string;
  aiRecommendations?: string[];
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
  findings?: Record<string, any>[];
  reportData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: String, required: true, index: true },
    websiteId: String,
    url: { type: String, required: true },
    status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
    overallScore: { type: Number, default: 0 },
    performance: { type: Schema.Types.Mixed, default: {} },
    seo: { type: Schema.Types.Mixed, default: {} },
    accessibility: { type: Schema.Types.Mixed, default: {} },
    security: { type: Schema.Types.Mixed, default: {} },
    mobile: { type: Schema.Types.Mixed, default: {} },
    technical: { type: Schema.Types.Mixed, default: {} },
    aiSummary: String,
    aiRecommendations: [String],
    startedAt: Date,
    completedAt: Date,
    duration: Number,
    error: String,
    findings: [{ type: Schema.Types.Mixed }],
    reportData: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const Analysis = mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
