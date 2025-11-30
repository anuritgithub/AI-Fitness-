export interface GenerateImageParams {
  prompt: string;
  type: 'exercise' | 'meal';
  width?: number;
  height?: number;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  prompt?: string;
  model?: string;
}

// Reusable function for both exercises and meals using OpenRouter
export async function generateImageWithOpenRouter(
  params: GenerateImageParams,
  apiKey: string
): Promise<ImageGenerationResponse> {
  try {
    if (!apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    console.log(`Generating ${params.type} image with OpenRouter...`);

    // Build the prompt based on type
    const enhancedPrompt = buildPrompt(params.prompt, params.type);

    console.log(`Enhanced prompt: ${enhancedPrompt.substring(0, 100)}...`);

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'AI Fitness Coach',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: `Generate a realistic image: ${enhancedPrompt}`,
          }
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', response.status, errorText);

      // Return fallback Pexels image
      const fallback = await generatePlaceholderImage(params.prompt, params.type);

      return {
        success: true,
        imageUrl: fallback,
        prompt: enhancedPrompt,
        model: 'pexels-placeholder',
      };
    }

    const data = await response.json();

    // Still using placeholders because OpenRouter does not produce direct image URLs yet
    const placeholderUrl = await generatePlaceholderImage(params.prompt, params.type);

    return {
      success: true,
      imageUrl: placeholderUrl,
      prompt: enhancedPrompt,
      model: 'pexels-placeholder',
    };

  } catch (error: any) {
    console.error(`Error generating ${params.type} image:`, error.message);

    // Return fallback Pexels image
    const fallback = await generatePlaceholderImage(params.prompt, params.type);

    return {
      success: true,
      imageUrl: fallback,
      prompt: buildPrompt(params.prompt, params.type),
      model: 'pexels-placeholder',
    };
  }
}

// Build optimized prompts for each type
function buildPrompt(basePrompt: string, type: 'exercise' | 'meal'): string {
  if (type === 'exercise') {
    return buildExercisePrompt(basePrompt);
  } else {
    return buildMealPrompt(basePrompt);
  }
}

function buildExercisePrompt(exerciseName: string): string {
  return `Professional fitness photograph of a person performing ${exerciseName}.
  Show correct form, proper posture, and anatomically accurate positioning.
  Clean gym or home environment with good lighting.
  High-resolution, detailed, fitness-focused visual.
  Suitable for a personal training guide.`;
}

function buildMealPrompt(mealName: string): string {
  return `Professional food photography of ${mealName} on a plate.
  Show appetizing presentation with accurate ingredients and proper portion size.
  Clean, bright lighting with neutral background.
  High-resolution food styling, restaurant quality.
  Suitable for a nutrition plan guide.`;
}

// ------------------------
// ❤️ NEW → PEXELS INTEGRATION
// ------------------------

async function generatePlaceholderImage(
  itemName: string,
  type: 'exercise' | 'meal'
): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_PEXELS_KEY;
    if (!apiKey) {
      console.error("Pexels API key missing!");
      return '/fallback.png';
    }

    const query =
      type === 'exercise'
        ? `${itemName} exercise fitness gym`
        : `${itemName} food meal nutrition`;

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error("Pexels fetch failed:", await response.text());
      return '/fallback.png';
    }

    const data = await response.json();

    return data.photos?.[0]?.src?.medium || '/fallback.png';
  } catch (error) {
    console.error("Pexels placeholder error:", error);
    return '/fallback.png';
  }
}
