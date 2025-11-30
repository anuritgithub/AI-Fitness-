'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserData } from '@/types';

// Validate API key on initialization
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
} else {
  console.log('GEMINI_API_KEY loaded successfully');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

// Helper function to extract JSON from text (removes code blocks, supports messy AI output)
function extractJSON(text: string): string {
  if (!text) return text;

  // Remove markdown code blocks, including optional language specifier
  let cleaned = text.replace(/^\s*```(json)?\s*|```\s*$/g, '').trim();

  // Find the first { ... } JSON using a simple bracket matcher
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

export async function generateFitnessPlan(userData: UserData) {
  // Check API key before making request
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file');
  }

  // Use the correct model name
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
  });

  const prompt = `
You are an expert fitness coach and nutritionist. Create a comprehensive, personalized fitness plan.

User Profile:
- Name: ${userData.name}
- Age: ${userData.age}, Gender: ${userData.gender}
- Height: ${userData.height}cm, Weight: ${userData.weight}kg
- Fitness Goal: ${userData.fitnessGoal}
- Fitness Level: ${userData.fitnessLevel}
- Workout Location: ${userData.workoutLocation}
- Dietary Preference: ${userData.dietaryPreference}
${userData.medicalHistory ? `- Medical History: ${userData.medicalHistory}` : ''}
${userData.stressLevel ? `- Stress Level: ${userData.stressLevel}` : ''}

Create a detailed 7-day plan. Return ONLY a valid JSON object with NO markdown formatting.

Required structure:
{
  "workoutPlan": [
    {
      "day": "Day 1",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "reps": "10-12",
          "rest": "60s",
          "description": "Brief description"
        }
      ]
    }
  ],
  "dietPlan": [
    {
      "day": "Day 1",
      "meals": [
        {
          "type": "breakfast",
          "name": "Meal Name",
          "calories": 350,
          "protein": "20g",
          "carbs": "45g",
          "fats": "10g",
          "description": "Brief description"
        }
      ]
    }
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"],
  "motivation": "Motivational message here"
}

Return only the JSON object without any markdown code blocks or additional text.`;

  try {
    console.log(`Generating fitness plan for ${userData.name}...`);
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('Received response from Gemini');

    // Extract JSON safely
    const cleanedJSON = extractJSON(text);

    // Safely attempt to parse JSON
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedJSON);
      console.log('JSON parsed successfully');
    } catch (parseErr: any) {
      console.error('JSON parsing failed:', parseErr.message);
      console.error('Raw response was:', text.substring(0, 200));
      throw new Error('Could not parse Gemini response as JSON');
    }

    // Validate response structure
    if (!parsedData.workoutPlan || !parsedData.dietPlan || !parsedData.tips || !parsedData.motivation) {
      throw new Error('Invalid response structure from AI - missing required fields');
    }

    console.log('Fitness plan generated successfully');
    return parsedData;
  } catch (error: any) {
    console.error('Error in generateFitnessPlan:', error.message);
    console.log('Returning fallback plan');
    return getFallbackPlan(userData);
  }
}

export async function generateMotivationQuote() {
  // Check API key
  if (!API_KEY) {
    console.warn('Gemini API key not found, using default quote');
    return 'Your only limit is you! Push harder today!';
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp'
    });
    
    const prompt = 'Generate a short, powerful fitness motivation quote (max 20 words). Return only the quote text without quotes or markdown.';
    
    const result = await model.generateContent(prompt);
    const quote = result.response.text().trim();
    
    // Remove quotes if present
    return quote.replace(/^["'`]|["'`]$/g, '');
  } catch (error: any) {
    console.error('Error generating motivation quote:', error.message);
    return 'Push yourself because no one else will!';
  }
}

// Fallback plan in case AI fails
function getFallbackPlan(userData: UserData) {
  return {
    workoutPlan: [
      {
        day: "Day 1 - Upper Body",
        exercises: [
          {
            name: "Push-ups",
            sets: 3,
            reps: "10-15",
            rest: "60s",
            description: "Classic upper body exercise targeting chest, shoulders, and triceps"
          },
          {
            name: "Dumbbell Rows",
            sets: 3,
            reps: "12-15",
            rest: "60s",
            description: "Strengthens back muscles and improves posture"
          },
          {
            name: "Shoulder Press",
            sets: 3,
            reps: "10-12",
            rest: "90s",
            description: "Builds shoulder strength and stability"
          }
        ]
      },
      {
        day: "Day 2 - Lower Body",
        exercises: [
          {
            name: "Squats",
            sets: 4,
            reps: "12-15",
            rest: "90s",
            description: "Fundamental leg exercise for overall lower body strength"
          },
          {
            name: "Lunges",
            sets: 3,
            reps: "10 each leg",
            rest: "60s",
            description: "Improves leg strength and balance"
          },
          {
            name: "Calf Raises",
            sets: 3,
            reps: "15-20",
            rest: "45s",
            description: "Strengthens calf muscles"
          }
        ]
      },
      {
        day: "Day 3 - Cardio & Core",
        exercises: [
          {
            name: "Running/Jogging",
            sets: 1,
            reps: "20-30 min",
            rest: "0s",
            description: "Cardiovascular endurance training"
          },
          {
            name: "Plank",
            sets: 3,
            reps: "30-60s",
            rest: "45s",
            description: "Core stability and strength"
          },
          {
            name: "Mountain Climbers",
            sets: 3,
            reps: "20 reps",
            rest: "60s",
            description: "Dynamic core and cardio exercise"
          }
        ]
      },
      {
        day: "Day 4 - Active Recovery",
        exercises: [
          {
            name: "Light Walking",
            sets: 1,
            reps: "30 min",
            rest: "0s",
            description: "Gentle movement for recovery"
          },
          {
            name: "Stretching",
            sets: 1,
            reps: "15 min",
            rest: "0s",
            description: "Full body flexibility work"
          }
        ]
      },
      {
        day: "Day 5 - Full Body",
        exercises: [
          {
            name: "Burpees",
            sets: 3,
            reps: "10-15",
            rest: "90s",
            description: "Full body conditioning exercise"
          },
          {
            name: "Pull-ups/Rows",
            sets: 3,
            reps: "8-12",
            rest: "90s",
            description: "Upper body pulling strength"
          },
          {
            name: "Jump Squats",
            sets: 3,
            reps: "12-15",
            rest: "90s",
            description: "Explosive leg power"
          }
        ]
      },
      {
        day: "Day 6 - Flexibility & Balance",
        exercises: [
          {
            name: "Yoga Flow",
            sets: 1,
            reps: "30 min",
            rest: "0s",
            description: "Improve flexibility and mental focus"
          },
          {
            name: "Balance Exercises",
            sets: 3,
            reps: "10 each side",
            rest: "45s",
            description: "Single leg balance work"
          }
        ]
      },
      {
        day: "Day 7 - Rest",
        exercises: [
          {
            name: "Complete Rest",
            sets: 0,
            reps: "N/A",
            rest: "N/A",
            description: "Allow your body to fully recover and rebuild"
          }
        ]
      }
    ],
    dietPlan: [
      {
        day: "Day 1",
        meals: [
          {
            type: "breakfast",
            name: "Oatmeal with Berries & Nuts",
            calories: 380,
            protein: "15g",
            carbs: "55g",
            fats: "12g",
            description: "Fiber-rich breakfast with antioxidants"
          },
          {
            type: "snack",
            name: "Greek Yogurt",
            calories: 150,
            protein: "18g",
            carbs: "12g",
            fats: "5g",
            description: "High protein snack"
          },
          {
            type: "lunch",
            name: userData.dietaryPreference === 'vegetarian' || userData.dietaryPreference === 'vegan' 
              ? "Chickpea Salad Bowl" 
              : "Grilled Chicken Salad",
            calories: 450,
            protein: "35g",
            carbs: "40g",
            fats: "18g",
            description: "Balanced protein and vegetables"
          },
          {
            type: "snack",
            name: "Apple with Almond Butter",
            calories: 180,
            protein: "6g",
            carbs: "22g",
            fats: "10g",
            description: "Healthy fats and fiber"
          },
          {
            type: "dinner",
            name: userData.dietaryPreference === 'vegetarian' || userData.dietaryPreference === 'vegan'
              ? "Tofu Stir-fry with Brown Rice"
              : "Baked Salmon with Quinoa",
            calories: 520,
            protein: "42g",
            carbs: "45g",
            fats: "20g",
            description: "Protein-rich dinner with complex carbs"
          }
        ]
      },
      {
        day: "Day 2",
        meals: [
          {
            type: "breakfast",
            name: "Scrambled Eggs with Whole Wheat Toast",
            calories: 350,
            protein: "22g",
            carbs: "35g",
            fats: "15g",
            description: "High protein breakfast"
          },
          {
            type: "snack",
            name: "Protein Smoothie",
            calories: 200,
            protein: "20g",
            carbs: "25g",
            fats: "5g",
            description: "Post-workout nutrition"
          },
          {
            type: "lunch",
            name: "Turkey/Veggie Wrap",
            calories: 420,
            protein: "30g",
            carbs: "45g",
            fats: "12g",
            description: "Portable balanced meal"
          },
          {
            type: "snack",
            name: "Mixed Nuts",
            calories: 180,
            protein: "6g",
            carbs: "8g",
            fats: "16g",
            description: "Healthy fats for energy"
          },
          {
            type: "dinner",
            name: "Lean Beef/Lentil Stew",
            calories: 480,
            protein: "38g",
            carbs: "42g",
            fats: "16g",
            description: "Hearty nutrient-dense meal"
          }
        ]
      },
      {
        day: "Day 3",
        meals: [
          {
            type: "breakfast",
            name: "Protein Pancakes with Fruit",
            calories: 400,
            protein: "25g",
            carbs: "50g",
            fats: "10g",
            description: "Energizing breakfast"
          },
          {
            type: "snack",
            name: "Cottage Cheese with Berries",
            calories: 160,
            protein: "16g",
            carbs: "18g",
            fats: "4g",
            description: "Protein-rich snack"
          },
          {
            type: "lunch",
            name: "Buddha Bowl",
            calories: 480,
            protein: "28g",
            carbs: "55g",
            fats: "18g",
            description: "Balanced macro meal"
          },
          {
            type: "snack",
            name: "Hummus with Veggies",
            calories: 150,
            protein: "6g",
            carbs: "18g",
            fats: "7g",
            description: "Fiber and protein"
          },
          {
            type: "dinner",
            name: "Grilled Fish with Sweet Potato",
            calories: 510,
            protein: "40g",
            carbs: "48g",
            fats: "18g",
            description: "Omega-3 rich dinner"
          }
        ]
      },
      {
        day: "Day 4",
        meals: [
          {
            type: "breakfast",
            name: "Smoothie Bowl",
            calories: 370,
            protein: "18g",
            carbs: "52g",
            fats: "12g",
            description: "Nutrient-dense start"
          },
          {
            type: "snack",
            name: "Boiled Eggs",
            calories: 140,
            protein: "12g",
            carbs: "2g",
            fats: "10g",
            description: "Quick protein"
          },
          {
            type: "lunch",
            name: "Quinoa Salad",
            calories: 440,
            protein: "26g",
            carbs: "48g",
            fats: "16g",
            description: "Complete protein meal"
          },
          {
            type: "snack",
            name: "Banana with Peanut Butter",
            calories: 210,
            protein: "8g",
            carbs: "28g",
            fats: "10g",
            description: "Energy boost"
          },
          {
            type: "dinner",
            name: "Chicken Breast with Vegetables",
            calories: 460,
            protein: "45g",
            carbs: "35g",
            fats: "14g",
            description: "Lean protein dinner"
          }
        ]
      },
      {
        day: "Day 5",
        meals: [
          {
            type: "breakfast",
            name: "Avocado Toast with Eggs",
            calories: 420,
            protein: "20g",
            carbs: "38g",
            fats: "22g",
            description: "Healthy fats breakfast"
          },
          {
            type: "snack",
            name: "Protein Bar",
            calories: 190,
            protein: "15g",
            carbs: "22g",
            fats: "7g",
            description: "Convenient nutrition"
          },
          {
            type: "lunch",
            name: "Pasta with Lean Protein",
            calories: 520,
            protein: "32g",
            carbs: "62g",
            fats: "16g",
            description: "Carb-loading meal"
          },
          {
            type: "snack",
            name: "Trail Mix",
            calories: 200,
            protein: "7g",
            carbs: "20g",
            fats: "12g",
            description: "Energy snack"
          },
          {
            type: "dinner",
            name: "Stir-fry with Brown Rice",
            calories: 490,
            protein: "35g",
            carbs: "50g",
            fats: "16g",
            description: "Asian-inspired balanced meal"
          }
        ]
      },
      {
        day: "Day 6",
        meals: [
          {
            type: "breakfast",
            name: "Whole Grain Cereal with Milk",
            calories: 340,
            protein: "16g",
            carbs: "50g",
            fats: "10g",
            description: "Quick breakfast"
          },
          {
            type: "snack",
            name: "Fruit Salad",
            calories: 120,
            protein: "2g",
            carbs: "30g",
            fats: "1g",
            description: "Vitamin boost"
          },
          {
            type: "lunch",
            name: "Soup and Sandwich Combo",
            calories: 460,
            protein: "28g",
            carbs: "52g",
            fats: "16g",
            description: "Comfort meal"
          },
          {
            type: "snack",
            name: "Cheese and Crackers",
            calories: 180,
            protein: "10g",
            carbs: "18g",
            fats: "9g",
            description: "Satisfying snack"
          },
          {
            type: "dinner",
            name: "Roasted Chicken with Veggies",
            calories: 500,
            protein: "42g",
            carbs: "38g",
            fats: "20g",
            description: "Classic dinner"
          }
        ]
      },
      {
        day: "Day 7",
        meals: [
          {
            type: "breakfast",
            name: "French Toast with Fruit",
            calories: 390,
            protein: "18g",
            carbs: "55g",
            fats: "12g",
            description: "Weekend breakfast"
          },
          {
            type: "snack",
            name: "Smoothie",
            calories: 170,
            protein: "12g",
            carbs: "26g",
            fats: "4g",
            description: "Refreshing snack"
          },
          {
            type: "lunch",
            name: "Pizza with Salad",
            calories: 550,
            protein: "28g",
            carbs: "60g",
            fats: "22g",
            description: "Treat meal"
          },
          {
            type: "snack",
            name: "Dark Chocolate & Almonds",
            calories: 160,
            protein: "5g",
            carbs: "14g",
            fats: "11g",
            description: "Antioxidant treat"
          },
          {
            type: "dinner",
            name: "Homemade Burger Bowl",
            calories: 520,
            protein: "38g",
            carbs: "42g",
            fats: "24g",
            description: "Satisfying dinner"
          }
        ]
      }
    ],
    tips: [
      `Stay hydrated - drink at least 8-10 glasses of water daily, especially during ${userData.workoutLocation} workouts`,
      "Get 7-8 hours of quality sleep each night for optimal recovery and muscle growth",
      "Always warm up for 5-10 minutes before workouts and cool down with stretching",
      `As a ${userData.fitnessLevel} level athlete, focus on proper form over heavy weights to prevent injuries`,
      `For ${userData.fitnessGoal}, maintain consistency and track your progress weekly`
    ],
    motivation: `${userData.name}, your journey to ${userData.fitnessGoal} every small step you take today builds the foundation for a stronger, healthier tomorrow. Believe in yourself, embrace the challenge, and let your determination shine — your best version is just around the corner! 🌟`
  };
}
