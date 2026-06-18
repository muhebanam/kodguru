'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import type { SkillCard } from '@kodguru/shared';
import { api } from '@/lib/api';
import { QuizRunner } from '@/components/lesson/quiz-runner';
import { HomeworkRunner } from '@/components/lesson/homework-runner';
import { AiTutorChat } from '@/components/lesson/ai-tutor-chat';
import { CompleteCard } from '@/components/lesson/complete-card';
import { ProgressStore } from '@/lib/progress.store';

// CodeMirror ভারী — শুধু দরকারে (এই section দেখালে) লোড হবে, প্রতি পাঠে নয়
const CodeLab = dynamic(() => import('@/components/code/code-lab').then((m) => m.CodeLab), {
  ssr: false,
  loading: () => <p className="text-sm text-board/60">কোড ল্যাব লোড হচ্ছে...</p>,
});

export default function LessonViewerPage() {
  const params = useParams<{ slug: string }>();
  const [card, setCard] = useState<SkillCard | null>(null);
  const [lastQuizScore, setLastQuizScore] = useState(0);
  const [message, setMessage] = useState('Lesson লোড হচ্ছে...');

  useEffect(() => {
    void api<{ card: SkillCard }>(`/skill-cards/${params.slug}`).then((res) => {
      if (res.ok) {
        setCard(res.data.card);
        setMessage('');
        void ProgressStore.update(res.data.card.slug, { lessonViewed: true });
      } else {
        setMessage(res.error.messageBn);
      }
    });
  }, [params.slug]);

  if (message) return <div className="rounded-card bg-white p-5 text-board/70">{message}</div>;
  if (!card) return null;

  return (
    <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[220px_1fr_300px]">
      <aside className="hidden rounded-card bg-white p-4 lg:block">
        <p className="text-sm font-bold text-board/60">Lesson Sections</p>
        {['সহজ ব্যাখ্যা', 'গ্রামের উদাহরণ', 'ধাপে ধাপে শেখা', 'কোড উদাহরণ', 'Code Lab', 'ভুলগুলো', 'Practice', 'Homework', 'Quiz', 'Mini Project'].map((item) => (
          <a key={item} href={`#${item}`} className="mt-2 block rounded-lg px-3 py-2 text-sm text-board/70 hover:bg-paper">{item}</a>
        ))}
      </aside>

      <main className="space-y-5">
        <section className="rounded-card bg-board p-6 text-chalk">
          <p className="text-sm font-bold text-chalk-yellow">{card.category} • {card.level}</p>
          <h1 className="mt-2 text-3xl font-bold">{card.banglaName}</h1>
          <p className="mt-1 text-chalk-dust">{card.title} — {card.pronunciation}</p>
          <p className="mt-4 text-sm text-chalk-dust">সময়: {card.estimatedTime} মিনিট • Status: {card.status}</p>
        </section>

        <section id="সহজ ব্যাখ্যা" className="rounded-card bg-white p-5">
          <h2 className="text-xl font-bold">সহজ ব্যাখ্যা</h2>
          <p className="mt-2 leading-relaxed text-board/75">{card.simpleMeaning}</p>
          <h3 className="mt-4 font-bold">কেন শিখব?</h3>
          <p className="mt-1 text-board/75">{card.whyLearn}</p>
        </section>

        <section id="গ্রামের উদাহরণ" className="rounded-card bg-white p-5">
          <h2 className="text-xl font-bold">গ্রামের উদাহরণ</h2>
          <p className="mt-2 rounded-lg bg-board/5 p-4 leading-relaxed text-board/75">🏡 {card.villageAnalogy}</p>
        </section>

        <section id="ধাপে ধাপে শেখা" className="rounded-card bg-white p-5">
          <h2 className="text-xl font-bold">ধাপে ধাপে শেখা</h2>
          <ol className="mt-4 space-y-4">
            {card.lessonSteps.map((step) => (
              <li key={step.order} className="rounded-lg border border-board-line/10 p-4">
                <p className="text-sm font-bold text-board/45">ধাপ {step.order}</p>
                <h3 className="font-bold">{step.title}</h3>
                <p className="mt-1 leading-relaxed text-board/75">{step.content}</p>
                {step.codeSnippet && <pre className="mt-3 overflow-auto rounded-lg bg-board p-3 text-sm text-chalk"><code>{step.codeSnippet}</code></pre>}
              </li>
            ))}
          </ol>
        </section>

        {card.codeExamples.length > 0 && (
          <section id="কোড উদাহরণ" className="rounded-card bg-white p-5">
            <h2 className="text-xl font-bold">কোড উদাহরণ</h2>
            {card.codeExamples.map((ex) => (
              <div key={ex.title} className="mt-4">
                <h3 className="font-bold">{ex.title}</h3>
                <pre className="mt-2 overflow-auto rounded-lg bg-board p-4 text-sm text-chalk"><code>{ex.code}</code></pre>
                <p className="mt-2 text-sm text-board/70">{ex.explanation}</p>
              </div>
            ))}
          </section>
        )}

        <section id="ভুলগুলো" className="rounded-card bg-white p-5">
          <h2 className="text-xl font-bold">সাধারণ ভুল</h2>
          <div className="mt-3 space-y-3">
            {card.commonMistakes.map((m) => (
              <div key={m.mistake} className="rounded-lg bg-paper p-4">
                <p className="font-bold">❌ {m.mistake}</p>
                <p className="mt-1 text-sm text-board/70">কেন হয়: {m.whyHappens}</p>
                <p className="mt-1 text-sm text-board/70">✅ সমাধান: {m.kindFix}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="Code Lab" className="rounded-card bg-white p-5">
          <h2 className="text-xl font-bold">কোড ল্যাব — নিজে লিখে দেখো</h2>
          <p className="mt-1 text-sm text-board/70">কোড লেখো, "চালাও" চাপো, সাথে সাথে ফলাফল দেখো। ভুল হলে ভয় নেই — এটাই শেখার জায়গা।</p>
          <div className="mt-4">
            <CodeLab
              starterHtml={card.category === 'styling' ? '<h1>আমার পাতা</h1>\n<p class="box">এই লেখাটি সাজাও</p>' : '<h1>আসসালামু আলাইকুম</h1>\n<p>এটি আমার প্রথম পাতা।</p>'}
              starterCss={card.category === 'styling' ? '.box{\n  color: teal;\n  padding: 12px;\n}' : ''}
            />
          </div>
        </section>

        <section id="Practice" className="rounded-card bg-white p-5">
          <h2 className="text-xl font-bold">Practice</h2>
          <TaskList tasks={card.practiceTasks} />
        </section>
        <section id="Homework" className="rounded-card bg-white p-5">
          <h2 className="text-xl font-bold">Homework</h2>
          <div className="mt-3">
            <HomeworkRunner slug={card.slug} tasks={card.homework} />
          </div>
        </section>
        <section id="Quiz" className="rounded-card bg-white p-5">
          <h2 className="text-xl font-bold">Quiz</h2>
          <div className="mt-3">
            <QuizRunner slug={card.slug} questions={card.quiz} onScore={setLastQuizScore} />
          </div>
        </section>
        {card.miniProject && (
          <section id="Mini Project" className="rounded-card bg-board p-5 text-chalk">
            <h2 className="text-xl font-bold">Mini Project</h2>
            <h3 className="mt-3 font-bold text-chalk-yellow">{card.miniProject.title}</h3>
            <p className="mt-2 text-chalk-dust">{card.miniProject.instruction}</p>
          </section>
        )}

        {card.status === 'approved' && (
          <CompleteCard slug={card.slug} quizScore={lastQuizScore} />
        )}
      </main>

      <aside className="rounded-card bg-white p-4 lg:sticky lg:top-4 lg:h-fit">
        {card.status === 'approved' ? (
          <AiTutorChat slug={card.slug} />
        ) : (
          <>
            <h2 className="font-bold">🤖 AI শিক্ষক</h2>
            <p className="mt-2 text-sm text-board/70">এই পাঠ অনুমোদিত হলে AI শিক্ষক এখানে সাহায্য করবে।</p>
            <div className="mt-3 rounded-lg bg-paper p-3 text-sm text-board/70">{card.aiTeacherGuide}</div>
          </>
        )}
      </aside>
    </div>
  );
}

function TaskList({ tasks }: { tasks: SkillCard['practiceTasks'] }) {
  if (!tasks.length) return <p className="mt-2 text-board/60">Task নেই।</p>;
  return <ol className="mt-3 space-y-3">{tasks.map((task, i) => <li key={`${task.title}-${i}`} className="rounded-lg bg-paper p-4"><p className="font-bold">{i + 1}. {task.title}</p><p className="mt-1 text-sm text-board/70">{task.instruction}</p></li>)}</ol>;
}
