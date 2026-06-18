import mongoose from 'mongoose';
import { CARD_CATEGORIES, CARD_STATUSES, LEVELS, QUIZ_TYPES } from '@kodguru/shared';

const lessonStepSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    codeSnippet: { type: String },
  },
  { _id: false },
);

const codeExampleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    language: { type: String, enum: ['html', 'css', 'javascript', 'bash', 'text'], required: true },
    code: { type: String, required: true },
    explanation: { type: String, required: true },
  },
  { _id: false },
);

const commonMistakeSchema = new mongoose.Schema(
  {
    mistake: { type: String, required: true },
    whyHappens: { type: String, required: true },
    kindFix: { type: String, required: true },
  },
  { _id: false },
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    instruction: { type: String, required: true },
    checkRules: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false },
);

const quizQuestionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: QUIZ_TYPES, required: true },
    question: { type: String, required: true },
    options: { type: [String], default: undefined },
    correctAnswer: { type: String, required: true },
    explanation: { type: String, required: true },
  },
  { _id: false },
);

const skillCardSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    title: { type: String, required: true, trim: true, index: 'text' },
    banglaName: { type: String, required: true, trim: true, index: 'text' },
    pronunciation: { type: String, required: true, trim: true },
    category: { type: String, enum: CARD_CATEGORIES, required: true, index: true },
    level: { type: String, enum: LEVELS, required: true, index: true },
    simpleMeaning: { type: String, required: true },
    villageAnalogy: { type: String, required: true },
    whyLearn: { type: String, required: true },
    learningGoals: { type: [String], default: [] },
    lessonSteps: { type: [lessonStepSchema], default: [] },
    examples: { type: [String], default: [] },
    codeExamples: { type: [codeExampleSchema], default: [] },
    commonMistakes: { type: [commonMistakeSchema], default: [] },
    practiceTasks: { type: [taskSchema], default: [] },
    homework: { type: [taskSchema], default: [] },
    miniProject: { type: taskSchema, default: undefined },
    quiz: { type: [quizQuestionSchema], default: [] },
    aiTeacherGuide: { type: String, required: true },
    status: { type: String, enum: CARD_STATUSES, default: 'draft', index: true },
    estimatedTime: { type: Number, required: true, min: 1 },
    prerequisites: { type: [String], default: [] },
    nextSkills: { type: [String], default: [] },
    reviewNote: { type: String },
    reviewedBy: { type: String },
    reviewedAt: { type: String },
    // curriculum/gamification (generate-curriculum থেকে)
    scId: { type: String, index: true },
    moduleId: { type: String, index: true },
    milestoneId: { type: String, index: true },
    globalOrder: { type: Number },
  },
  { timestamps: true },
);

skillCardSchema.index({ category: 1, status: 1, level: 1 });
skillCardSchema.index({ title: 'text', banglaName: 'text', simpleMeaning: 'text' });

skillCardSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const SkillCardModel = (mongoose.models.SkillCard ?? mongoose.model('SkillCard', skillCardSchema)) as mongoose.Model<any>;
