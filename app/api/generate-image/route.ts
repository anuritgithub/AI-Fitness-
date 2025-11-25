import { NextRequest, NextResponse } from 'next/server';
import { generateImageWithOpenRouter } from '@/lib/openrouter-image';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { prompt, itemName, type } = body;

    if (!prompt || !type) {
      return NextResponse.json(
        { success: false, error: 'Prompt and type are required' },
        { status: 400 }
      );
    }

    if (!['exercise', 'meal'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be "exercise" or "meal"' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not found in environment variables');
      return NextResponse.json(
        {
          success: false,
          error: 'Image generation service is not configured',
        },
        { status: 500 }
      );
    }

    console.log(`Generating ${type} image for: ${itemName}`);

    // Use the reusable function
    const result = await generateImageWithOpenRouter(
      {
        prompt,
        type,
        width: 512,
        height: 512,
      },
      apiKey
    );

    if (result.success && result.imageUrl) {
      console.log(`Image generated successfully`);
      
      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        model: result.model,
      });
    } else {
      console.error(`Image generation failed: ${result.error}`);
      
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to generate image',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 60;
