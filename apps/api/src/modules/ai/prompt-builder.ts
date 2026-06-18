import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { AiMode, SkillCard } from '@kodguru/shared';
import { logger } from '../../utils/logger.js';

/**
 * Prompt builder — system prompt তৈরি করে তিনটি অংশ মিলিয়ে:
 *  1. আপনার লেখা persona + guardrail (apps/api/src/ai/*.md) — মানুষ-অনুমোদিত
 *  2. এই Skill Card-এর অনুমোদিত content (যাতে AI বানিয়ে না বলে)
 *  3. mode অনুযায়ী নির্দিষ্ট নির্দেশ
 *
 * নিয়ম: AI শুধু দেওয়া card content থেকে উত্তর দেবে; বাইরের প্রশ্নে বলবে
 * "এটা teacher review দরকার" — এটাই hallucination guardrail.
 */

const here = dirname(fileURLToPath(import.meta.url));
const aiDir = join(here, '..', '..', 'ai');

function loadMd(file: string): string {
  try {
    return readFileSync(join(aiDir, file), 'utf8');
  } catch (err) {
    logger.warn(`AI prompt file পড়া যায়নি: ${file}`, err);
    return '';
  }
}

// startup-এ একবার পড়ে cache — প্রতি request-এ disk read নয়
const PERSONA = loadMd('ai-teacher-system-prompt.md');
const GUARDRAIL = loadMd('guardrail-tone-guide.md');

const MODE_INSTRUCTION: Record<AiMode, string> = {
  explain: 'শিক্ষার্থীর প্রশ্নের স্বাভাবিক, ধাপে ধাপে বাংলা ব্যাখ্যা দাও।',
  simpler: 'আগের চেয়ে আরও সহজ করে, ছোট বাক্যে, ক্লাস ৫-এর ভাষায় বলো।',
  village: 'বাজার, খাতা, মাঠ, ডিমের ট্রে, মাটির ব্যাংক, ঘর, তালা-চাবি — এসব গ্রামীণ উদাহরণ দিয়ে বোঝাও।',
  homework: 'এই বিষয়ে ৩ স্তরের হোমওয়ার্ক দাও: সহজ, মাঝারি, চ্যালেঞ্জ।',
  check: 'নিচের স্বয়ংক্রিয় যাচাইয়ের ফলাফল শিক্ষার্থীকে দয়ালু ভাষায় বুঝিয়ে দাও — আগে প্রশংসা, তারপর কী ঠিক করতে হবে। যাচাইয়ের ফলাফলের বিরুদ্ধে যেও না।',
};

/** approved card-এর দরকারি অংশ টুকরো করে দাও — পুরো object নয় (token বাঁচে) */
function cardContext(card: SkillCard): string {
  return [
    `# এই পাঠের নাম: ${card.banglaName} (${card.title})`,
    `সহজ মানে: ${card.simpleMeaning}`,
    `গ্রামের উদাহরণ: ${card.villageAnalogy}`,
    `কেন শিখব: ${card.whyLearn}`,
    `শেখার ধাপ: ${card.lessonSteps.map((s) => s.title).join(' → ')}`,
    card.commonMistakes.length
      ? `সাধারণ ভুল: ${card.commonMistakes.map((m) => m.mistake).join('; ')}`
      : '',
    `AI শিক্ষকের জন্য নির্দেশ: ${card.aiTeacherGuide}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildSystemPrompt(
  card: SkillCard,
  mode: AiMode,
  checkResultBn?: string,
): string {
  const parts = [
    PERSONA,
    GUARDRAIL,
    '## এই কথোপকথনের পাঠ-প্রসঙ্গ (এর বাইরে নিশ্চিতভাবে উত্তর দেবে না)',
    cardContext(card),
    `## এখনকার কাজ\n${MODE_INSTRUCTION[mode]}`,
  ];
  if (mode === 'check' && checkResultBn) {
    parts.push(`## স্বয়ংক্রিয় যাচাইয়ের ফলাফল\n${checkResultBn}`);
  }
  parts.push(
    '## কড়া নিয়ম\n' +
      '- উত্তর সবসময় বাংলায়।\n' +
      '- উপরের পাঠ-প্রসঙ্গের বাইরের প্রশ্নে বলো: "এটা এই পাঠের বাইরে — তোমার শিক্ষকের সাহায্য নাও।"\n' +
      '- কখনো API key/password চাইবে না।\n' +
      '- তুমি একজন বন্ধুসুলভ খেলার গাইডের মতো: শিক্ষার্থী practice/কুইজ/হোমওয়ার্কের সরাসরি উত্তর চাইলে ' +
      'প্রথমে পুরো উত্তর দিও না — একটি ছোট hint আর একটি পথ-দেখানো প্রশ্ন দাও, নিজে চেষ্টা করতে উৎসাহ দাও। ' +
      'ভুল করলে কখনো বকা নয়; "ভুল করা মানেই শেখা, আরেকবার চেষ্টা করো" — এভাবে সাহস দাও।\n' +
      '- উত্তর সংক্ষিপ্ত রাখো, শেষে একটি ছোট practice দাও।',
  );
  return parts.join('\n\n');
}
