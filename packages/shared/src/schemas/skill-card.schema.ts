import { z } from 'zod';
import { CARD_CATEGORIES, CARD_STATUSES, LEVELS, QUIZ_TYPES } from '../constants.js';

/**
 * Skill Card — প্ল্যাটফর্মের মূল কনটেন্ট একক।
 * ১৩২–১৩৫টি কার্ড পরে JSON seed বা admin panel দিয়ে import হবে,
 * তাই এই schema-ই হলো import validation-এর একমাত্র গেট।
 *
 * নিয়ম: Mongoose model, API validation, admin form — সবাই
 * এই schema থেকে derive করবে। কোথাও আলাদা করে field লিখবেন না।
 */

/** একটি পাঠের ধাপ (lesson step) */
export const lessonStepSchema = z.object({
  order: z.number().int().min(1),
  title: z.string().min(1),          // ধাপের শিরোনাম (বাংলায়)
  content: z.string().min(1),        // সহজ বাংলায় ব্যাখ্যা (markdown)
  imageUrl: z.string().url().optional(),
  codeSnippet: z.string().optional(),
});

/** কোড উদাহরণ */
export const codeExampleSchema = z.object({
  title: z.string().min(1),
  language: z.enum(['html', 'css', 'javascript', 'bash', 'text']),
  code: z.string().min(1),
  explanation: z.string().min(1),    // কোডটা কী করছে — বাংলায়
});

/** সাধারণ ভুল ও তার সমাধান */
export const commonMistakeSchema = z.object({
  mistake: z.string().min(1),        // ভুলটা কী
  whyHappens: z.string().min(1),     // কেন হয়
  kindFix: z.string().min(1),        // দয়ালু ভাষায় সমাধান — কখনো লজ্জা দেওয়া নয়
});

/** অনুশীলন/হোমওয়ার্ক টাস্ক */
export const taskSchema = z.object({
  title: z.string().min(1),
  instruction: z.string().min(1),    // ধাপে ধাপে নির্দেশনা, বাংলায়
  /**
   * Rule-based checker-এর জন্য (Phase 4)।
   * যেমন: { type: 'html_contains', tags: ['h1','p','img','a'] }
   * VS Code-এর মতো non-code কার্ডে: { type: 'checklist', items: [...] }
   */
  checkRules: z.record(z.unknown()).optional(),
});

/** কুইজ প্রশ্ন */
export const quizQuestionSchema = z.object({
  type: z.enum(QUIZ_TYPES),
  question: z.string().min(1),
  options: z.array(z.string()).min(2).max(6).optional(), // mcq হলে দরকার
  correctAnswer: z.string().min(1),
  explanation: z.string().min(1),    // উত্তর ভুল হলে দয়ালু ব্যাখ্যা
});

/** মূল Skill Card schema */
export const skillCardSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/), // URL-safe id, যেমন: "html5"
  title: z.string().min(1),            // ইংরেজি নাম, যেমন: "HTML5"
  banglaName: z.string().min(1),       // বাংলা নাম
  pronunciation: z.string().min(1),    // বাংলা উচ্চারণ, যেমন: "এইচটিএমএল ফাইভ"
  category: z.enum(CARD_CATEGORIES),
  level: z.enum(LEVELS),

  simpleMeaning: z.string().min(1),    // এক লাইনে সহজ মানে
  villageAnalogy: z.string().min(1),   // গ্রাম/ঘরের উদাহরণ
  whyLearn: z.string().min(1),         // কেন শিখবে

  learningGoals: z.array(z.string().min(1)).min(1),
  lessonSteps: z.array(lessonStepSchema).min(1),
  examples: z.array(z.string()).default([]),
  codeExamples: z.array(codeExampleSchema).default([]),
  commonMistakes: z.array(commonMistakeSchema).default([]),

  practiceTasks: z.array(taskSchema).default([]),
  homework: z.array(taskSchema).default([]),
  miniProject: taskSchema.optional(),
  quiz: z.array(quizQuestionSchema).default([]),

  /** AI টিউটর এই কার্ড পড়ানোর সময় কোন সুরে, কোন উদাহরণে কথা বলবে */
  aiTeacherGuide: z.string().min(1),

  status: z.enum(CARD_STATUSES).default('draft'),
  estimatedTime: z.number().int().min(1), // মিনিটে
  prerequisites: z.array(z.string()).default([]), // অন্য কার্ডের slug
  nextSkills: z.array(z.string()).default([]),    // অন্য কার্ডের slug

  /** review workflow metadata — teacher/admin যাচাইয়ের সময় সেট হয় (optional) */
  reviewNote: z.string().optional(),   // teacher-এর মন্তব্য (কেন reviewed/rejected)
  reviewedBy: z.string().optional(),   // যিনি যাচাই করেছেন (email)
  reviewedAt: z.string().optional(),   // ISO time
});

/** status পরিবর্তনের request body — teacher/admin panel এটি পাঠায় */
export const skillCardStatusUpdateSchema = z.object({
  status: z.enum(CARD_STATUSES),
  note: z.string().max(2000).optional(), // ঐচ্ছিক feedback
});
export type SkillCardStatusUpdate = z.infer<typeof skillCardStatusUpdateSchema>;

/** JSON seed import-এর জন্য: একসাথে অনেক কার্ড */
export const skillCardImportSchema = z.array(skillCardSchema);

export type LessonStep = z.infer<typeof lessonStepSchema>;
export type CodeExample = z.infer<typeof codeExampleSchema>;
export type CommonMistake = z.infer<typeof commonMistakeSchema>;
export type Task = z.infer<typeof taskSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type SkillCard = z.infer<typeof skillCardSchema>;
