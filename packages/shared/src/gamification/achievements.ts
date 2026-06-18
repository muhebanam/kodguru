/**
 * Achievement — অর্জনের তালিকা, pure function। progress snapshot থেকে হিসাব।
 * server/client এক উৎস, testable।
 */
export interface ProgressSnapshot {
  level: number;
  streakDays: number;
  completedCards: number;
  completedModules: number;
  completedMilestones: number;
}

export interface Achievement {
  id: string;
  labelBn: string;
  descBn: string;
  icon: string;
  earned: boolean;
}

export function computeAchievements(p: ProgressSnapshot): Achievement[] {
  const list: { id: string; labelBn: string; descBn: string; icon: string; ok: boolean }[] = [
    { id: 'first_card', labelBn: 'প্রথম পদক্ষেপ', descBn: 'প্রথম পাঠ শেষ করেছ', icon: '🌱', ok: p.completedCards >= 1 },
    { id: 'ten_cards', labelBn: 'অধ্যবসায়ী', descBn: '১০টি পাঠ শেষ', icon: '📚', ok: p.completedCards >= 10 },
    { id: 'half_way', labelBn: 'অর্ধেক পথ', descBn: '৬৬টি পাঠ শেষ', icon: '⛰️', ok: p.completedCards >= 66 },
    { id: 'all_cards', labelBn: 'গুরু', descBn: 'সব ১৩২টি পাঠ শেষ', icon: '🎓', ok: p.completedCards >= 132 },
    { id: 'first_module', labelBn: 'মডিউল বিজয়', descBn: 'প্রথম module শেষ', icon: '🧩', ok: p.completedModules >= 1 },
    { id: 'first_milestone', labelBn: 'অধ্যায় বিজয়', descBn: 'প্রথম milestone জয়', icon: '🏆', ok: p.completedMilestones >= 1 },
    { id: 'streak_3', labelBn: 'ধারাবাহিক', descBn: '৩ দিনের ধারা', icon: '🔥', ok: p.streakDays >= 3 },
    { id: 'streak_7', labelBn: 'অগ্নিশিখা', descBn: '৭ দিনের ধারা', icon: '⚡', ok: p.streakDays >= 7 },
    { id: 'streak_30', labelBn: 'অপ্রতিরোধ্য', descBn: '৩০ দিনের ধারা', icon: '💎', ok: p.streakDays >= 30 },
    { id: 'level_10', labelBn: 'মাঝারি কোডার', descBn: 'লেভেল ১০ ছুঁয়েছ', icon: '⭐', ok: p.level >= 10 },
    { id: 'level_30', labelBn: 'দক্ষ ডেভেলপার', descBn: 'লেভেল ৩০ ছুঁয়েছ', icon: '🌟', ok: p.level >= 30 },
    { id: 'level_60', labelBn: 'এক্সপার্ট', descBn: 'লেভেল ৬০ ছুঁয়েছ', icon: '👑', ok: p.level >= 60 },
  ];
  return list.map((a) => ({ id: a.id, labelBn: a.labelBn, descBn: a.descBn, icon: a.icon, earned: a.ok }));
}

export function earnedCount(p: ProgressSnapshot): number {
  return computeAchievements(p).filter((a) => a.earned).length;
}
