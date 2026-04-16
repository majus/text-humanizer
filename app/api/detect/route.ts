import { NextRequest, NextResponse } from 'next/server';

const GPTZERO_API_URL = 'https://api.gptzero.me/v2/predict/text';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const apiKey = process.env.GPTZERO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GPTZero API key is not configured. Set GPTZERO_API_KEY in your environment.' },
        { status: 503 }
      );
    }

    const response = await fetch(GPTZERO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ document: text.trim() }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        { error: `GPTZero API error: ${response.status}`, detail: errorBody },
        { status: response.status }
      );
    }

    const data = await response.json();
    const doc = data?.documents?.[0] ?? data;

    return NextResponse.json({
      score: doc.completely_generated_prob ?? doc.average_generated_prob ?? null,
      verdict: doc.predicted_class ?? null,
      sentences: doc.sentences ?? [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
