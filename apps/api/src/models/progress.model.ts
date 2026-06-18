import mongoose from 'mongoose';

/**
 * Progress — প্রতি user প্রতি কার্ডে একটি record।
 * server-side source of truth (IndexedDB-র বদলে), যাতে XP double-award না হয়
 * এবং যেকোনো ডিভাইসে progress থাকে।
 */
const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cardSlug: { type: String, required: true, index: true },
    moduleId: { type: String },
    milestoneId: { type: String },
    completed: { type: Boolean, default: false },
    perfect: { type: Boolean, default: false },
    quizScore: { type: Number, default: 0 },
    xpAwarded: { type: Number, default: 0 },
    completedAt: { type: String },
  },
  { timestamps: true },
);
progressSchema.index({ userId: 1, cardSlug: 1 }, { unique: true });

export type ProgressRecord = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  cardSlug: string;
  moduleId?: string;
  milestoneId?: string;
  completed: boolean;
  perfect: boolean;
  quizScore: number;
  xpAwarded: number;
  completedAt?: string;
};

export const ProgressModel =
  (mongoose.models.Progress ?? mongoose.model('Progress', progressSchema)) as mongoose.Model<ProgressRecord>;
