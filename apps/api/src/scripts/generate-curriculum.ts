import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Curriculum generator — ১৩২ কার্ডকে যৌক্তিক ক্রমে ১১ milestone → ৬৭ module-এ সাজায়।
 * কার্ডের content বদলায় না; শুধু কাঠামো (কোথায়, কোন ক্রমে, কত XP, কী দিয়ে unlock) তৈরি হয়।
 * deterministic — আবার চালালে হুবহু একই ফল।
 *
 * চালান:  npm run gen:curriculum   → seeds/curriculum.json তৈরি হয়
 */

interface MilestoneDef {
  id: string;
  titleBn: string;
  subtitleBn: string;
  moduleCount: number;     // এই milestone-এ কয়টি module (যোগফল = 67)
  bossProjectBn: string;   // শেষের "final boss" প্রজেক্ট
  slugs: string[];         // এই milestone-এর কার্ড, শেখার ক্রমে
}

// ১১ milestone — শূন্য → expert। moduleCount যোগফল = ৬৭।
const MILESTONES: MilestoneDef[] = [
  {
    id: 'M01', titleBn: 'প্রথম পদক্ষেপ', subtitleBn: 'যন্ত্রপাতি ও পরিবেশ চেনা',
    moduleCount: 4,
    bossProjectBn: 'নিজের কম্পিউটারে VS Code, Node, Git সেট করে প্রথম GitHub repo বানাও ও push করো।',
    slugs: ['vs-code', 'vs-code-terminal', 'nodejs', 'git-scm', 'git', 'github', 'github-desktop'],
  },
  {
    id: 'M02', titleBn: 'ওয়েবের কাঠামো', subtitleBn: 'HTML ও CSS-এর হাতেখড়ি',
    moduleCount: 2,
    bossProjectBn: 'HTML ও CSS দিয়ে নিজের একটি পরিচিতি পেজ (নাম, ছবি, লিংক) বানাও।',
    slugs: ['html5', 'css3', 'flexbox', 'css-grid'],
  },
  {
    id: 'M03', titleBn: 'সুন্দর সাজানো', subtitleBn: 'CSS framework ও UI',
    moduleCount: 3,
    bossProjectBn: 'Tailwind দিয়ে একটি সুন্দর, মোবাইল-বান্ধব landing page বানাও।',
    slugs: ['tailwind-css', 'daisyui', 'hero-ui', 'shadcn', 'font-awesome', 'google-fonts'],
  },
  {
    id: 'M04', titleBn: 'জাভাস্ক্রিপ্টের প্রাণ', subtitleBn: 'JavaScript ও ব্রাউজার',
    moduleCount: 7,
    bossProjectBn: 'JavaScript দিয়ে একটি To-Do অ্যাপ বানাও যা localStorage-এ কাজ মনে রাখে।',
    slugs: ['javascript', 'es6', 'typescript', 'dom', 'bom', 'window-object', 'location-api',
            'history-api', 'localstorage', 'sessionstorage', 'promise', 'async-await',
            'settimeout-setinterval-cleartimeout'],
  },
  {
    id: 'M05', titleBn: 'React রাজ্য', subtitleBn: 'React ও আধুনিক frontend',
    moduleCount: 6,
    bossProjectBn: 'React + Vite দিয়ে একটি আবহাওয়া বা মুভি সার্চ অ্যাপ বানাও (API থেকে data এনে)।',
    slugs: ['react', 'vite', 'jsx', 'nextjs', 'react-toastify', 'recharts', 'swiperjs',
            'axios', 'fetch-api', 'date-fns', 'next-dynamic'],
  },
  {
    id: 'M06', titleBn: 'সার্ভারের গল্প', subtitleBn: 'Node ও Express দিয়ে backend',
    moduleCount: 7,
    bossProjectBn: 'Express দিয়ে একটি REST API বানাও — CRUD সহ, পরিষ্কার folder কাঠামোতে।',
    slugs: ['nodejs-backend', 'expressjs', 'rest-api', 'crud-api', 'cors', 'nodemon', 'middleware',
            'routes', 'controllers', 'services', 'modular-pattern', 'mvc-clean-architecture',
            'api-endpoint-design', 'environment-variables'],
  },
  {
    id: 'M07', titleBn: 'ডাটার ভাণ্ডার', subtitleBn: 'MongoDB ও database',
    moduleCount: 4,
    bossProjectBn: 'MongoDB Atlas + Mongoose দিয়ে আগের API-তে আসল database যুক্ত করো।',
    slugs: ['mongodb', 'mongodb-atlas', 'mongoose-odm', 'nosql-booster', 'objectid',
            'mongodb-operators', 'mongodb-adapter'],
  },
  {
    id: 'M08', titleBn: 'নিরাপত্তা ও প্রবেশ', subtitleBn: 'Auth, role ও security',
    moduleCount: 6,
    bossProjectBn: 'JWT + HTTPOnly cookie দিয়ে login/register বানাও, role আলাদা করো, route সুরক্ষিত করো।',
    slugs: ['betterauth', 'jwt', 'httponly-cookies', 'session-management', 'google-oauth',
            'github-oauth', 'protected-route', 'rbac', 'password-reset', 'email-verification',
            'security-review'],
  },
  {
    id: 'M09', titleBn: 'টাকা ও পরীক্ষা', subtitleBn: 'Payment ও testing',
    moduleCount: 6,
    bossProjectBn: 'Stripe বা SSLCommerz দিয়ে একটি checkout বানাও এবং তার জন্য কিছু test লেখো।',
    slugs: ['stripe', 'stripe-checkout', 'stripe-webhooks', 'sslcommerz', 'sslcommerz-sandbox',
            'introduction-to-testing', 'uat', 'end-to-end-testing', 'automated-tests',
            'error-handling', 'form-handling-and-validation', 'performance-optimization'],
  },
  {
    id: 'M10', titleBn: 'দুনিয়াতে প্রকাশ', subtitleBn: 'Deployment ও engineering',
    moduleCount: 7,
    bossProjectBn: 'নিজের একটি full-stack অ্যাপ Vercel + Atlas-এ লাইভ করো, custom domain সহ।',
    slugs: ['github-pages', 'netlify', 'surge', 'vercel', 'railway', 'render', 'custom-domain',
            'ssl', 'prd', 'requirement-analysis', 'user-stories', 'git-worktrees',
            'api-integration', 'modular-architecture', 'feature-based-module-organization'],
  },
  {
    id: 'M11', titleBn: 'AI যুগের ডেভেলপার', subtitleBn: 'AI দিয়ে দ্রুত ও স্মার্ট কোডিং',
    moduleCount: 15,
    bossProjectBn: 'AI tool (Cursor/Claude Code) ব্যবহার করে একটি সম্পূর্ণ full-stack অ্যাপ বানাও ও deploy করো।',
    slugs: ['ai-mindset-development', 'prompt-engineering', 'context-engineering',
            'wireframing-prototyping-with-ai', 'cursor-ai', 'cursor-agents', 'claude-code-cli',
            'claudemd', 'github-copilot-pro', 'coderabbit', 'ollama', 'opencode', 'antigravity',
            'zai', 'boltnew', 'lovable', 'v0-by-vercel', 'figma-mcp', 'figma-make', 'github-mcp',
            'supabase-mcp', 'browser-mcp', 'firebase-studio', 'google-ai-studio',
            'replit-ai-agent', 'windsurf-ide', 'parallel-ai-agents', 'ai-code-review',
            'ai-refactoring', 'ai-security-review', 'ai-integration-in-full-stack-project',
            'vibe-coding'],
  },
];

/** N কার্ডকে m module-এ যথাসম্ভব সমানভাবে ভাগ করো (size 1-3) */
function chunkEven<T>(arr: T[], parts: number): T[][] {
  const result: T[][] = [];
  const base = Math.floor(arr.length / parts);
  let remainder = arr.length % parts;
  let i = 0;
  for (let p = 0; p < parts; p++) {
    const size = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
    result.push(arr.slice(i, i + size));
    i += size;
  }
  return result;
}

function main(): void {
  const milestones: unknown[] = [];
  const modules: unknown[] = [];
  const cardPatch: Record<string, unknown> = {}; // slug → gamification fields

  let scCounter = 0;
  let moduleCounter = 0;

  MILESTONES.forEach((ms, msIndex) => {
    const moduleChunks = chunkEven(ms.slugs, ms.moduleCount);
    const moduleIds: string[] = [];

    moduleChunks.forEach((chunk, modIdxInMs) => {
      moduleCounter++;
      const moduleId = `MOD${String(moduleCounter).padStart(2, '0')}`;
      moduleIds.push(moduleId);

      const prevModuleId = moduleCounter > 1 ? `MOD${String(moduleCounter - 1).padStart(2, '0')}` : null;

      chunk.forEach((slug, cardIdxInMod) => {
        scCounter++;
        const scId = `SC${String(scCounter).padStart(3, '0')}`;
        cardPatch[slug] = {
          scId,
          milestoneId: ms.id,
          moduleId,
          orderInModule: cardIdxInMod + 1,
          globalOrder: scCounter,
        };
      });

      modules.push({
        moduleId,
        milestoneId: ms.id,
        orderInMilestone: modIdxInMs + 1,
        titleBn: `${ms.titleBn} — পর্ব ${modIdxInMs + 1}`,
        cardSlugs: chunk,
        bonusXp: 50, // module শেষ করলে
        unlockAfterModule: prevModuleId, // আগের module শেষ হলে খোলে
      });
    });

    milestones.push({
      milestoneId: ms.id,
      order: msIndex + 1,
      titleBn: ms.titleBn,
      subtitleBn: ms.subtitleBn,
      moduleIds,
      bossProjectBn: ms.bossProjectBn,
      rewardXp: 200, // milestone শেষ করলে
      unlockAfterMilestone: msIndex > 0 ? MILESTONES[msIndex - 1]!.id : null,
    });
  });

  const out = {
    version: 1,
    generatedAt: new Date().toISOString(),
    totals: { milestones: milestones.length, modules: modules.length, cards: scCounter },
    milestones,
    modules,
    cardPatch,
  };

  const here = dirname(fileURLToPath(import.meta.url));
  const outPath = join(here, '..', '..', 'seeds', 'curriculum.json');
  writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');

  console.log('✅ Curriculum তৈরি হয়েছে:');
  console.log(`   milestones: ${milestones.length}`);
  console.log(`   modules:    ${modules.length}`);
  console.log(`   cards:      ${scCounter}`);
  console.log(`   → ${outPath}`);

  // sanity check
  if (milestones.length !== 11) throw new Error(`milestone count ${milestones.length} ≠ 11`);
  if (modules.length !== 67) throw new Error(`module count ${modules.length} ≠ 67`);
  if (scCounter !== 132) throw new Error(`card count ${scCounter} ≠ 132`);
}

main();
