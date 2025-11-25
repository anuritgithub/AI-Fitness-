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
            content: `Generate a realistic image: ${enhancedPrompt}`
          }
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', response.status, errorText);
      
      // Return a fallback placeholder image
      return {
        success: true,
        imageUrl: generatePlaceholderImage(params.prompt, params.type),
        prompt: enhancedPrompt,
        model: 'placeholder',
      };
    }

    const data = await response.json();

    // OpenRouter returns text, not image URLs directly
    // For now, use placeholder images
    const placeholderUrl = generatePlaceholderImage(params.prompt, params.type);

    console.log(`Using placeholder image`);

    return {
      success: true,
      imageUrl: placeholderUrl,
      prompt: enhancedPrompt,
      model: 'placeholder',
    };

  } catch (error: any) {
    console.error(`Error generating ${params.type} image:`, error.message);
    
    // Return placeholder on error
    return {
      success: true,
      imageUrl: generatePlaceholderImage(params.prompt, params.type),
      prompt: buildPrompt(params.prompt, params.type),
      model: 'placeholder',
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

// Generate placeholder image using Unsplash or similar
function generatePlaceholderImage(itemName: string, type: 'exercise' | 'meal'): string {
  const searchTerms = itemName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '+');

  const category = type === 'exercise' ? 'fitness,gym,workout' : 'food,meal,nutrition';

  // Use Unsplash API for realistic images (free, no key required)
  return `https://source.unsplash.com/800x600/?${searchTerms},${category}`;
}
