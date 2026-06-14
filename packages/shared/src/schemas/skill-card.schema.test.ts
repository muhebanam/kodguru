import { describe, expect, it } from 'vitest';
import { skillCardImportSchema, skillCardSchema } from './skill-card.schema.js';

const baseCard = {
  slug: 'html5',
  title: 'HTML5',
  banglaName: 'এইচটিএমএল ফাইভ',
  pronunciation: 'এইচ টি এম এল ফাইভ',
  category: 'markup',
  level: 'beginner',
  simpleMeaning: 'ওয়েব পেজের হাড়-গোড় বানানোর ভাষা।',
  villageAnalogy: 'যেমন ঘর বানাতে খুঁটি লাগে, ওয়েব পেজ বানাতে HTML লাগে।',
  whyLearn: 'ওয়েবসাইটের গঠন বানাতে HTML জানা দরকার।',
  learningGoals: ['একটি basic webpage বানাতে পারবে'],
  lessonSteps: [
    { order: 1, title: 'HTML কী', content: 'HTML দিয়ে ওয়েব পেজের structure বানানো হয়।' },
  ],
  examples: ['নিজের নাম দেখানো'],
  codeExamples: [
    {
      title: 'প্রথম heading',
      language: 'html',
      code: '<h1>আমার নাম</h1>',
      explanation: 'h1 দিয়ে বড় heading দেখা যায়।',
    },
  ],
  commonMistakes: [
    {
      mistake: 'tag বন্ধ না করা',
      whyHappens: 'শুরু tag দিলেও শেষ tag ভুলে যায়',
      kindFix: 'দরজার মতো tag-ও বন্ধ করতে হয়।',
    },
  ],
  practiceTasks: [{ title: 'Heading বানাও', instruction: 'h1 দিয়ে নিজের নাম লেখো।' }],
  homework: [{ title: 'পরিচয় লেখো', instruction: 'p tag দিয়ে নিজের গ্রামের নাম লেখো।' }],
  quiz: [
    {
      type: 'mcq',
      question: 'HTML কী কাজে লাগে?',
      options: ['রং করতে', 'গঠন বানাতে'],
      correctAnswer: 'গঠন বানাতে',
      explanation: 'HTML হলো ওয়েব পেজের গঠন।',
    },
  ],
  aiTeacherGuide: 'শিশুর মতো সহজ বাংলায় বোঝাও।',
  status: 'draft',
  estimatedTime: 20,
  prerequisites: [],
  nextSkills: ['css3'],
};

describe('skillCardSchema', () => {
  it('accepts a complete beginner skill card', () => {
    expect(skillCardSchema.parse(baseCard).slug).toBe('html5');
  });

  it('rejects non-url-safe slugs', () => {
    expect(() => skillCardSchema.parse({ ...baseCard, slug: 'HTML 5' })).toThrow();
  });

  it('validates batch imports for future 132+ cards', () => {
    expect(skillCardImportSchema.parse([baseCard])).toHaveLength(1);
  });
});
