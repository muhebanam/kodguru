import type { AiMessage } from '@kodguru/shared';
import { env } from '../../../config/env.js';
import type { AiProvider } from './provider.interface.js';

/**
 * Groq provider — OpenAI-compatible chat completions, fetch দিয়ে।
 * Gemini ব্যর্থ/quota শেষ হলে fallback। মডেল: env.GROQ_MODEL।
 */
export class GroqProvider implements AiProvider {
  readonly name = 'groq';

  isConfigured(): boolean {
    return env.GROQ_API_KEY.length > 0;
  }

  async chat(systemPrompt: string, messages: AiMessage[]): Promise<string> {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL,
        temperature: 0.4,
        max_tokens: 800,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      throw new Error(`Groq ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('Groq: empty response');
    return text;
  }
}
