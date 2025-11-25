import { NextResponse } from 'next/server';

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

  return NextResponse.json({
    geminiKeyExists: !!geminiKey,
    geminiKeyLength: geminiKey?.length || 0,
    geminiKeyPrefix: geminiKey?.substring(0, 10) || 'not found',
    elevenLabsKeyExists: !!elevenLabsKey,
    nodeEnv: process.env.NODE_ENV,
  });
}
