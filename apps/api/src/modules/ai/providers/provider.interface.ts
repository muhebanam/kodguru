import type { AiMessage } from '@kodguru/shared';

/**
 * Aی provider-এর সাধারণ চুক্তি (interface)।
 * Gemini/Groq/Ollama — সবাই এটি মেনে চলে, তাই manager কাউকে আলাদাভাবে চেনে না।
 * নতুন provider যোগ করতে হলে শুধু এই interface implement করলেই চলবে।
 */
export interface AiProvider {
  readonly name: string;
  /** key/config আছে কিনা — না থাকলে manager একে skip করবে */
  isConfigured(): boolean;
  /** systemPrompt + কথোপকথন দিয়ে উত্তর তৈরি; ব্যর্থ হলে throw করবে */
  chat(systemPrompt: string, messages: AiMessage[]): Promise<string>;
}
