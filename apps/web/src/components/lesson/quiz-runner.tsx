'use client';

import { useState } from 'react';
import type { SkillCard } from '@kodguru/shared';
import { ProgressStore } from '@/lib/progress.store';

/**
 * ইন্টারেক্টিভ কুইজ — শিক্ষার্থী উত্তর বেছে নেয়, score হিসাব হয়,
 * ভুল হলে দয়ালু ভাষায় ব্যাখ্যা দেখায় (কখনো লজ্জা দেয় না)।
 * শেষে score IndexedDB-তে save হয়।
 */
export function QuizRunner({
  slug,
  questions,
}: {
  slug: string;
  questions: SkillCard['quiz'];
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (questions.length === 0) {
    return <p className="text-board/60">এই কার্ডে এখনো কুইজ যোগ হয়নি।</p>;
  }

  const correctCount = questions.filter(
    (q, i) => (answers[i] ?? '').trim().toLowerCase() === q.correctAnswer.trim().toLowerCase(),
  ).length;
  const score = Math.round((correctCount / questions.length) * 100);

  const submit = async () => {
    setSubmitted(true);
    await ProgressStore.update(slug, { quizScore: score });
  };

  return (
    <div className="space-y-4">
      {questions.map((q, i) => {
        const chosen = answers[i];
        const isCorrect = (chosen ?? '').trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

        return (
          <div key={i} className="rounded-card border border-board-line/20 bg-white p-4">
            <p className="font-medium">{i + 1}. {q.question}</p>

            {/* mcq / true_false: বোতাম */}
            {q.options && q.options.length > 0 ? (
              <div className="mt-3 grid gap-2">
                {q.options.map((opt) => {
                  const active = chosen === opt;
                  const showState = submitted && (opt === q.correctAnswer || active);
                  const good = submitted && opt === q.correctAnswer;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [i]: opt }))}
                      className={`rounded-lg border px-4 py-2.5 text-left text-sm ${
                        showState
                          ? good
                            ? 'border-green-600 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : active
                            ? 'border-board bg-board/5'
                            : 'border-board-line/30'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* fill_blank: ইনপুট */
              <input
                type="text"
                disabled={submitted}
                value={chosen ?? ''}
                onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
                placeholder="এখানে উত্তর লিখো"
                className="mt-3 w-full rounded-lg border border-board-line/30 px-3 py-2.5 text-sm"
              />
            )}

            {submitted && (
              <p className={`mt-3 text-sm ${isCorrect ? 'text-green-700' : 'text-board/70'}`}>
                {isCorrect ? '✅ ঠিক হয়েছে! ' : '💡 ঠিক উত্তর: ' + q.correctAnswer + '। '}
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <button
          type="button"
          onClick={submit}
          disabled={Object.keys(answers).length < questions.length}
          className="w-full rounded-lg bg-board px-4 py-3 font-bold text-chalk disabled:opacity-40"
        >
          উত্তর জমা দাও
        </button>
      ) : (
        <div className="rounded-card bg-board p-4 text-center text-chalk">
          <p className="text-3xl font-bold text-chalk-yellow">{score}%</p>
          <p className="mt-1 text-sm text-chalk-dust">
            {questions.length}টির মধ্যে {correctCount}টি ঠিক।{' '}
            {score >= 60 ? 'দারুণ করেছ! 🎉' : 'আরেকবার পাঠটা দেখে চেষ্টা করো — পারবেই।'}
          </p>
          <button
            type="button"
            onClick={() => { setSubmitted(false); setAnswers({}); }}
            className="mt-3 rounded-lg bg-chalk-yellow px-4 py-2 text-sm font-bold text-board-deep"
          >
            আবার চেষ্টা করি
          </button>
        </div>
      )}
    </div>
  );
}
