import { NextRequest, NextResponse } from 'next/server';
import { detectAI } from '@/lib/detector';
import { postprocess } from '@/lib/postprocess';
import { getSystemPrompt, LEVEL_PARAMS } from '@/lib/prompts';
import { generateWithProvider } from '@/lib/providers';
import { RewriteLevel } from '@/lib/types';

const MAX_BATCH_COUNT = 20;
const MAX_TEXT_LENGTH = 5000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { texts, level = 'medium', style = 'humanize', tone = 'conversational', model, apiKey } = body;

    if (!model || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields: model and apiKey' }, { status: 400 });
    }

    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'texts must be a non-empty array' }, { status: 400 });
    }

    if (texts.length > MAX_BATCH_COUNT) {
      return NextResponse.json({ error: `Batch exceeds maximum of ${MAX_BATCH_COUNT} items` }, { status: 400 });
    }

    const params = LEVEL_PARAMS[level as RewriteLevel] ?? LEVEL_PARAMS['medium'];
    const systemPrompt = getSystemPrompt(level, style, tone);

    const results = await Promise.all(
      texts.map(async (text: unknown, index: number) => {
        if (typeof text !== 'string' || text.trim().length === 0) {
          return { index, error: `Item at index ${index} must be a non-empty string`, input: String(text ?? ''), output: null };
        }
        if (text.length > MAX_TEXT_LENGTH) {
          return { index, error: `Item exceeds ${MAX_TEXT_LENGTH} character limit`, input: text, output: null };
        }
        try {
          const raw = await generateWithProvider(model, apiKey, systemPrompt, text.trim(), {
            temperature: params.temperature,
            topP: params.topP,
          });
          const humanized = postprocess(raw, { light: true });
          const detection = detectAI(humanized);
          return { index, input: text, output: humanized, finalScore: detection.score, error: null };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          return { index, error: message, input: text, output: null };
        }
      })
    );

    const successCount = results.filter(r => r.error === null).length;
    return NextResponse.json({ results, count: results.length, successCount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
