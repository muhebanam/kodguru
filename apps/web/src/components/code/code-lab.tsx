'use client';

import { useMemo, useState } from 'react';
import { CodeEditor } from './code-editor';

type Tab = 'html' | 'css' | 'javascript';

/**
 * Code Lab — শিক্ষার্থী HTML/CSS/JS লিখে সাথে সাথে ফলাফল দেখে।
 *
 * নিরাপত্তা: preview iframe-এ sandbox="allow-scripts" — কিন্তু
 * allow-same-origin দেওয়া হয়নি। কারণ ওই দুইটা একসাথে দিলে
 * framed কোড নিজের sandbox খুলে ফেলতে পারে। শিক্ষার্থীর কোড
 * চালানোর সময় এটা বাধ্যতামূলক।
 *
 * মোবাইলে: editor আর preview উপর-নিচে (stacked)।
 * বড় স্ক্রিনে: পাশাপাশি।
 */
export function CodeLab({
  starterHtml = '',
  starterCss = '',
  starterJs = '',
}: {
  starterHtml?: string;
  starterCss?: string;
  starterJs?: string;
}) {
  const [tab, setTab] = useState<Tab>('html');
  const [htmlCode, setHtmlCode] = useState(starterHtml);
  const [cssCode, setCssCode] = useState(starterCss);
  const [jsCode, setJsCode] = useState(starterJs);
  const [runKey, setRunKey] = useState(0); // "চালাও" চাপলে preview নতুন করে render

  // "চালাও" না চাপা পর্যন্ত srcDoc বদলায় না — প্রতিটি keystroke-এ reload নয়
  const srcDoc = useMemo(() => {
    return `<!doctype html><html lang="bn"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>body{font-family:system-ui,sans-serif;padding:12px}${cssCode}</style>
</head><body>${htmlCode}<script>try{${jsCode}}catch(e){document.body.insertAdjacentHTML('beforeend','<pre style=color:crimson>'+e+'</pre>')}<\/script></body></html>`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'html', label: 'HTML' },
    { id: 'css', label: 'CSS' },
    { id: 'javascript', label: 'JS' },
  ];

  const reset = () => {
    setHtmlCode(starterHtml);
    setCssCode(starterCss);
    setJsCode(starterJs);
    setRunKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      {/* এডিটর */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex rounded-lg bg-board/5 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-pressed={tab === t.id}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  tab === t.id ? 'bg-board text-chalk' : 'text-board'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => setRunKey((k) => k + 1)}
              className="rounded-lg bg-chalk-yellow px-4 py-1.5 text-sm font-bold text-board-deep"
            >
              ▶ চালাও
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-board-line/30 px-3 py-1.5 text-sm font-medium text-board"
            >
              রিসেট
            </button>
          </div>
        </div>

        {/* প্রতিটি ভাষার জন্য আলাদা editor — tab দিয়ে শুধু দেখা/লুকানো */}
        <div className={tab === 'html' ? 'h-64' : 'hidden'}>
          <CodeEditor value={htmlCode} language="html" onChange={setHtmlCode} ariaLabel="HTML কোড লেখার জায়গা" />
        </div>
        <div className={tab === 'css' ? 'h-64' : 'hidden'}>
          <CodeEditor value={cssCode} language="css" onChange={setCssCode} ariaLabel="CSS কোড লেখার জায়গা" />
        </div>
        <div className={tab === 'javascript' ? 'h-64' : 'hidden'}>
          <CodeEditor value={jsCode} language="javascript" onChange={setJsCode} ariaLabel="JavaScript কোড লেখার জায়গা" />
        </div>
      </div>

      {/* লাইভ প্রিভিউ */}
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="mb-2 text-sm font-medium text-board/70">ফলাফল</p>
        <iframe
          key={runKey}
          srcDoc={srcDoc}
          title="কোডের ফলাফল"
          sandbox="allow-scripts"
          className="h-64 w-full rounded-lg border border-board-line/30 bg-white"
        />
      </div>
    </div>
  );
}
