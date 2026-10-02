import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  firebaseUid?: string;
  email: string;
  password?: string;
  name: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  website?: string;
  location?: string;
  aiPreference: 'Beginner Friendly' | 'Balanced' | 'Detailed';
  provider?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true },
    firebaseUid: { type: String, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String, required: true },
    displayName: String,
    photoURL: String,
    bio: String,
    website: String,
    location: String,
    aiPreference: { type: String, enum: ['Beginner Friendly', 'Balanced', 'Detailed'], default: 'Balanced' },
    provider: { type: String, default: 'email' },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>('User', UserSchema);
