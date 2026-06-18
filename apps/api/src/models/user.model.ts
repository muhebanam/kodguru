import mongoose from 'mongoose';
import { ROLES } from '@kodguru/shared';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'student', index: true },
    xp: { type: Number, default: 0, min: 0 },
    badges: { type: [String], default: [] },
    // gamification: streak ও bonus tracking
    streakDays: { type: Number, default: 0, min: 0 },
    lastActiveDay: { type: String, default: null }, // "YYYY-MM-DD"
    completedModules: { type: [String], default: [] },   // bonus যাদের দেওয়া হয়েছে
    completedMilestones: { type: [String], default: [] },
  },
  { timestamps: true },
);

userSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

export type UserRecord = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'teacher' | 'admin';
  xp: number;
  badges: string[];
  streakDays: number;
  lastActiveDay: string | null;
  completedModules: string[];
  completedMilestones: string[];
  createdAt: Date;
  updatedAt: Date;
};

export const UserModel = (mongoose.models.User ?? mongoose.model('User', userSchema)) as mongoose.Model<UserRecord>;
