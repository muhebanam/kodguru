'use client';

import { openDB, type IDBPDatabase } from 'idb';

/**
 * Progress store — IndexedDB-তে শিক্ষার্থীর অগ্রগতি রাখে।
 * server লাগে না — অফলাইনেও কাজ করে। দ্বিতীয় ব্যবহারকারী/teacher review
 * দরকার হলে পরে server progress যোগ হবে, এই layer তখন cache হিসেবে থাকবে।
 *
 * key = skill card slug।
 */
const DB_NAME = 'kodguru-progress';
const DB_VERSION = 1;
const STORE = 'progress';

export interface SkillProgress {
  slug: string;
  lessonViewed: boolean;
  practiceDone: boolean;
  quizScore: number; // 0–100
  homeworkPassed: boolean;
  badgeEarned: boolean;
  updatedAt: number;
}

const EMPTY = (slug: string): SkillProgress => ({
  slug,
  lessonViewed: false,
  practiceDone: false,
  quizScore: 0,
  homeworkPassed: false,
  badgeEarned: false,
  updatedAt: Date.now(),
});

let dbPromise: Promise<IDBPDatabase> | null = null;
function getDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'slug' });
        }
      },
    });
  }
  return dbPromise;
}

/** ব্যাজ শর্ত: পাঠ দেখা + কুইজ ৬০%+ + হোমওয়ার্ক পাস */
function computeBadge(p: SkillProgress): boolean {
  return p.lessonViewed && p.quizScore >= 60 && p.homeworkPassed;
}

export const ProgressStore = {
  async get(slug: string): Promise<SkillProgress> {
    const db = await getDB();
    if (!db) return EMPTY(slug);
    return (await db.get(STORE, slug)) ?? EMPTY(slug);
  },

  async update(slug: string, patch: Partial<SkillProgress>): Promise<SkillProgress> {
    const db = await getDB();
    const current = (await this.get(slug)) ?? EMPTY(slug);
    const next: SkillProgress = { ...current, ...patch, slug, updatedAt: Date.now() };
    next.badgeEarned = computeBadge(next);
    if (db) await db.put(STORE, next);
    return next;
  },

  async getAll(): Promise<SkillProgress[]> {
    const db = await getDB();
    if (!db) return [];
    return db.getAll(STORE);
  },

  /** নিজের অগ্রগতি ব্যাকআপ/রপ্তানি করার সুবিধা */
  async exportJson(): Promise<string> {
    return JSON.stringify(await this.getAll(), null, 2);
  },
};
