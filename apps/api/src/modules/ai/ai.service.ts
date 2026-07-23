import { Injectable, ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const HTML_SYSTEM_PROMPTS: Record<string, string> = {
  improve: `You are a professional resume writing assistant. The user will give you HTML content from a resume field.
Improve the writing quality: use strong action verbs, remove filler words, make it more impactful and professional.
Return ONLY the improved HTML. Preserve all HTML tags and structure exactly. No explanations, no markdown fences.`,

  grammar: `You are a grammar correction assistant for resumes. The user will give you HTML content.
Fix all grammar, spelling, punctuation, and style errors while keeping the meaning as close to the original as possible.
Return ONLY the corrected HTML. Preserve all HTML tags and structure exactly. No explanations, no markdown fences.`,

  shorten: `You are a concise writing assistant for resumes. The user will give you HTML content.
Make it significantly shorter: remove redundant phrases, filler words, and unnecessary details while keeping the key points and impact.
Return ONLY the shortened HTML. Preserve all HTML tags and structure exactly. No explanations, no markdown fences.`,
};

// Same three actions, but for plain-text fields (portfolio bios) — no HTML
// in, no HTML out. Without this, models happily wrap plain text in <p> tags
// anyway because the HTML prompts above talk about HTML throughout.
const TEXT_SYSTEM_PROMPTS: Record<string, string> = {
  improve: `You are a professional bio writing assistant. The user will give you plain text from a developer portfolio.
Improve the writing quality: use strong, confident language, remove filler words, make it more impactful and professional.
Return ONLY the improved plain text. No HTML tags, no quotes, no markdown, no explanations.`,

  grammar: `You are a grammar correction assistant. The user will give you plain text.
Fix all grammar, spelling, punctuation, and style errors while keeping the meaning as close to the original as possible.
Return ONLY the corrected plain text. No HTML tags, no quotes, no markdown, no explanations.`,

  shorten: `You are a concise writing assistant. The user will give you plain text.
Make it significantly shorter: remove redundant phrases, filler words, and unnecessary details while keeping the key points and impact.
Return ONLY the shortened plain text. No HTML tags, no quotes, no markdown, no explanations.`,
};

@Injectable()
export class AiService {
  private readonly provider: 'ollama' | 'openrouter';
  private readonly url: string;
  private readonly model: string;
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.provider = config.get<'ollama' | 'openrouter'>('ai.provider') ?? 'ollama';

    if (this.provider === 'openrouter') {
      this.apiKey = config.get<string>('ai.openrouter.apiKey') ?? '';
      this.model =
        config.get<string>('ai.openrouter.model') ?? 'meta-llama/llama-3.3-70b-instruct:free';
      this.url =
        config.get<string>('ai.openrouter.url') ?? 'https://openrouter.ai/api/v1/chat/completions';
    } else {
      // Ollama's OpenAI-compatible endpoint — no API key needed, self-hosted.
      this.apiKey = '';
      this.model = config.get<string>('ai.ollama.model') ?? 'llama3.2:3b';
      const base = config.get<string>('ai.ollama.url') ?? 'http://ollama:11434';
      this.url = `${base.replace(/\/$/, '')}/v1/chat/completions`;
    }
  }

  async rewrite(
    text: string,
    action: 'improve' | 'grammar' | 'shorten',
    format: 'html' | 'text' = 'html',
  ): Promise<string> {
    if (this.provider === 'openrouter' && !this.apiKey) {
      throw new ServiceUnavailableException('AI writing features are not configured');
    }
    if (!text.trim()) {
      throw new BadRequestException('Text cannot be empty');
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;

    const prompts = format === 'text' ? TEXT_SYSTEM_PROMPTS : HTML_SYSTEM_PROMPTS;

    let res: Response;
    try {
      res = await fetch(this.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: prompts[action] },
            { role: 'user', content: text },
          ],
        }),
        // Local CPU inference (Ollama) is much slower than a cloud API —
        // give it real headroom rather than the ATS engine's 15s.
        signal: AbortSignal.timeout(60_000),
      });
    } catch {
      throw new ServiceUnavailableException(
        this.provider === 'ollama'
          ? 'Local AI model is unavailable — is the ollama service running and the model pulled?'
          : 'AI service is unavailable',
      );
    }

    if (!res.ok) {
      throw new ServiceUnavailableException(`AI service error: ${res.status}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const result = data.choices?.[0]?.message?.content?.trim();
    if (!result) {
      throw new ServiceUnavailableException('Empty response from AI service');
    }

    return result;
  }
}
