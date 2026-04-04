import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (ext === 'txt') {
      const text = await file.text();
      return NextResponse.json({ text, name: file.name });
    }

    if (ext === 'docx') {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      return NextResponse.json({ text: result.value, name: file.name });
    }

    if (ext === 'pdf') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await pdfParse(buffer);
      return NextResponse.json({ text: result.text, name: file.name });
    }

    return NextResponse.json({ error: `Unsupported file type: .${ext}. Supported: .txt, .docx, .pdf` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to parse file' }, { status: 500 });
  }
}
