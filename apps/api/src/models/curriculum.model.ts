import mongoose from 'mongoose';

/**
 * Curriculum — milestones ও modules (seeds/curriculum.json থেকে আসে)।
 * একটি single-document collection (key: 'main') — পড়া সহজ, খুব ছোট ডেটা।
 */
const curriculumSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'main' },
    version: Number,
    milestones: { type: mongoose.Schema.Types.Mixed, default: [] },
    modules: { type: mongoose.Schema.Types.Mixed, default: [] },
  },
  { timestamps: true, minimize: false },
);

export const CurriculumModel =
  (mongoose.models.Curriculum ?? mongoose.model('Curriculum', curriculumSchema)) as mongoose.Model<any>;
