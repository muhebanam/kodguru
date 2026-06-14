import type { AiMessage } from '@kodguru/shared';
import { env } from '../../../config/env.js';
import type { AiProvider } from './provider.interface.js';

/**
 * Ollama provider — সম্পূর্ণ লোকাল/অফলাইন fallback।
 * ইন্টারনেট/quota কিছুই না থাকলেও নিজের PC-তে মডেল চললে কাজ করে।
 * env.OLLAMA_BASE_URL সেট থাকলেই সক্রিয়।
 */
export class OllamaProvider implements AiProvider {
  readonly name = 'ollama';

  isConfigured(): boolean {
    return env.OLLAMA_BASE_URL.length > 0;
  }

  async chat(systemPrompt: string, messages: AiMessage[]): Promise<string> {
    const res = await fetch(`${env.OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: env.OLLAMA_MODEL,
        stream: false,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      throw new Error(`Ollama ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as { message?: { content?: string } };
    const text = data.message?.content;
    if (!text) throw new Error('Ollama: empty response');
    return text;
  }
}
