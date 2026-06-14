'use client';

import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

type Lang = 'html' | 'css' | 'javascript';

function langExt(lang: Lang) {
  if (lang === 'css') return css();
  if (lang === 'javascript') return javascript();
  return html();
}

/**
 * CodeMirror 6 এডিটর — মোবাইল-বান্ধব, হালকা (~300KB)।
 * Monaco নয় কারণ Monaco মোবাইল টাচ কিবোর্ডে খারাপ চলে ও ভারী।
 * wrapper লাইব্রেরি ছাড়াই সরাসরি mount — নিয়ন্ত্রণ বেশি, dependency কম।
 */
export function CodeEditor({
  value,
  language,
  onChange,
  ariaLabel,
}: {
  value: string;
  language: Lang;
  onChange: (next: string) => void;
  ariaLabel: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!host.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        langExt(language),
        oneDark,
        EditorView.lineWrapping,
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChangeRef.current(u.state.doc.toString());
        }),
        EditorView.theme({
          '&': { fontSize: '14px', borderRadius: '0.5rem', height: '100%' },
          '.cm-scroller': { fontFamily: 'ui-monospace, monospace' },
        }),
      ],
    });

    const v = new EditorView({ state, parent: host.current });
    view.current = v;
    return () => v.destroy();
    // language বদলালে নতুন editor; value শুধু প্রথমবার seed হয় (controlled-loop এড়াতে)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  return (
    <div
      ref={host}
      role="textbox"
      aria-label={ariaLabel}
      className="h-full min-h-[180px] overflow-hidden rounded-lg border border-board-line/30"
    />
  );
}
