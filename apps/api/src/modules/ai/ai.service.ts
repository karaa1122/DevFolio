import { Injectable, ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const SYSTEM_PROMPTS: Record<string, string> = {
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

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly url: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = config.get<string>('openrouter.apiKey') ?? '';
    this.model = config.get<string>('openrouter.model') ?? 'meta-llama/llama-3.3-70b-instruct:free';
    this.url = config.get<string>('openrouter.url') ?? 'https://openrouter.ai/api/v1/chat/completions';
  }

  async rewrite(text: string, action: 'improve' | 'grammar' | 'shorten'): Promise<string> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException('AI writing features are not configured');
    }
    if (!text.trim()) {
      throw new BadRequestException('Text cannot be empty');
    }

    const res = await fetch(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS[action] },
          { role: 'user', content: text },
        ],
      }),
    });


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
