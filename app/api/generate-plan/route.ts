import { NextRequest, NextResponse } from 'next/server';
import { generateFitnessPlan } from '@/lib/gemini.server';

export async function POST(req: NextRequest) {
  try {
    const userData = await req.json();
    
    console.log('Generating plan for:', userData.name);
    
    const plan = await generateFitnessPlan(userData);
    
    console.log('Plan generated successfully');
    
    return NextResponse.json({ 
      success: true, 
      plan 
    });
  } catch (error: any) {
    console.error('Error generating plan:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate plan. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';                             // Changed from 'edge' for better debugging
export const maxDuration = 60;                           // Allow up to 60 seconds
