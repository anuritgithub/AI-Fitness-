import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/elevenlabs';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    
    if (!text || text.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY || '';
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }
    
    const audioBuffer = await generateSpeech(text, apiKey);
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error generating speech:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate speech' 
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
