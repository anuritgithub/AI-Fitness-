export interface UserData {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  fitnessGoal: 'weight-loss' | 'muscle-gain' | 'general-fitness' | 'endurance' | 'flexibility';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  workoutLocation: 'home' | 'gym' | 'outdoor';
  dietaryPreference: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'keto' | 'paleo';
  medicalHistory?: string;
  stressLevel?: 'low' | 'medium' | 'high';
}

export interface WorkoutDay {
  day: string;
  exercises: Exercise[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  description: string;
}

export interface MealPlan {
  day: string;
  meals: Meal[];
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: string;
  carbs: string;
  fats: string;
  description: string;
}

export interface FitnessPlan {
  workoutPlan: WorkoutDay[];
  dietPlan: MealPlan[];
  tips: string[];
  motivation: string;
}
