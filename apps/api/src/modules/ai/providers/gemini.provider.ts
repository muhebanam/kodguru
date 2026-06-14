import type { AiMessage } from '@kodguru/shared';
import { env } from '../../../config/env.js';
import type { AiProvider } from './provider.interface.js';

/**
 * Gemini provider — REST API, কোনো SDK নয় (depend কম, version churn এড়ানো)।
 * Free tier: শুধু Flash/Flash-Lite মডেল ফ্রি। মডেলের নাম env.GEMINI_MODEL থেকে।
 * গুরুত্বপূর্ণ: project-এ billing চালু করলে free tier চলে যায়।
 */
export class GeminiProvider implements AiProvider {
  readonly name = 'gemini';

  isConfigured(): boolean {
    return env.GEMINI_API_KEY.length > 0;
  }

  async chat(systemPrompt: string, messages: AiMessage[]): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      throw new Error(`Gemini ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini: empty response');
    return text;
  }
}
