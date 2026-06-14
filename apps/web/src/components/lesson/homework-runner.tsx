'use client';

import { useState } from 'react';
import type { SkillCard } from '@kodguru/shared';
import { checkHomeworkSubmission, type CheckResult } from '@kodguru/shared';
import { ProgressStore } from '@/lib/progress.store';

/**
 * হোমওয়ার্ক — শিক্ষার্থী উত্তর/কোড লেখে, rule-based checker চালায়,
 * বাংলায় পাস/ফেল ও কী বাকি তা জানায়। AI নয় — দ্রুত, নিশ্চিত, অফলাইন।
 * (পরে AI feedback layer যোগ হবে এই static check-এর উপরে।)
 */
export function HomeworkRunner({
  slug,
  tasks,
}: {
  slug: string;
  tasks: SkillCard['homework'];
}) {
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, CheckResult>>({});

  if (tasks.length === 0) {
    return <p className="text-board/60">এই কার্ডে এখনো হোমওয়ার্ক যোগ হয়নি।</p>;
  }

  const runCheck = async (index: number, task: SkillCard['homework'][number]) => {
    const rule = (task.checkRules ?? {}) as Record<string, unknown>;
    const result = checkHomeworkSubmission(inputs[index] ?? '', rule);
    setResults((r) => ({ ...r, [index]: result }));

    // সব হোমওয়ার্ক পাস হলে progress-এ homeworkPassed = true
    const allPassed = tasks.every((t, i) => {
      const res = i === index ? result : results[i];
      return res?.passed;
    });
    if (allPassed) await ProgressStore.update(slug, { homeworkPassed: true });
  };

  return (
    <div className="space-y-4">
      {tasks.map((task, i) => {
        const res = results[i];
        return (
          <div key={i} className="rounded-card border border-board-line/20 bg-white p-4">
            <h4 className="font-bold">{task.title}</h4>
            <p className="mt-1 text-sm text-board/70">{task.instruction}</p>

            <textarea
              value={inputs[i] ?? ''}
              onChange={(e) => setInputs((s) => ({ ...s, [i]: e.target.value }))}
              placeholder="এখানে তোমার কোড বা উত্তর লেখো"
              rows={4}
              className="mt-3 w-full rounded-lg border border-board-line/30 p-3 font-mono text-sm"
            />

            <button
              type="button"
              onClick={() => runCheck(i, task)}
              className="mt-2 rounded-lg bg-board px-4 py-2 text-sm font-bold text-chalk"
            >
              যাচাই করো
            </button>

            {res && (
              <p
                className={`mt-3 rounded-lg p-3 text-sm ${
                  res.passed ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-900'
                }`}
              >
                {res.passed ? '✅ ' : '💡 '}
                {res.messageBn}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
