'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FitnessPlan } from '@/types';
import { Dumbbell, Utensils, Lightbulb, Heart, RefreshCw, Image as ImageIcon, X, Volume2 } from 'lucide-react';
import VoicePlayer from './VoicePlayer';
import ExportPDF from './ExportPDF';
import ImageModal from './ImageModal';

interface PlanDisplayProps {
  plan: FitnessPlan;
  onRegenerate: () => void;
}

export default function PlanDisplay({ plan, onRegenerate }: PlanDisplayProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});
  const [cardImages, setCardImages] = useState<{ [key: string]: string | null }>({});
  const [loadingCards, setLoadingCards] = useState<{ [key: string]: boolean }>({});
  const [errorCards, setErrorCards] = useState<{ [key: string]: string | null }>({});
  const [playingAudio, setPlayingAudio] = useState<{ [key: string]: boolean }>({});

  const handleItemClick = (itemName: string) => {
    setSelectedItem(itemName);
    setShowImageModal(true);
  };

  const toggleCardImage = async (cardId: string, itemName: string, type: 'exercise' | 'meal') => {
    setErrorCards(prev => ({ ...prev, [cardId]: null }));
    setLoadingCards(prev => ({ ...prev, [cardId]: true }));
    setCardImages(prev => ({ ...prev, [cardId]: null }));

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: itemName, itemName, type }),
      });

      if (!response.ok) throw new Error('API Error: ' + response.status);
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) throw new Error('Invalid server response');

      const data = await response.json();
      if (data.success && data.imageUrl) {
        setCardImages(prev => ({ ...prev, [cardId]: data.imageUrl }));
        setExpandedCards(prev => ({ ...prev, [cardId]: true }));
      } else throw new Error(data.error || 'Failed to generate image');
    } catch (error: any) {
      setErrorCards(prev => ({ ...prev, [cardId]: error.message }));
      setCardImages(prev => ({ ...prev, [cardId]: null }));
      setExpandedCards(prev => ({ ...prev, [cardId]: false }));
    } finally {
      setLoadingCards(prev => ({ ...prev, [cardId]: false }));
    }
  };

  const hideCardImage = (cardId: string) => {
    setExpandedCards(prev => ({ ...prev, [cardId]: false }));
    setCardImages(prev => ({ ...prev, [cardId]: null }));
    setErrorCards(prev => ({ ...prev, [cardId]: null }));
  };

  const toggleAudio = (dayKey: string, text: string) => {
    setPlayingAudio(prev => {
      const currentlyPlaying = prev[dayKey] || false;
      if (!currentlyPlaying) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
          setPlayingAudio(prev => ({ ...prev, [dayKey]: false }));
        };
        speechSynthesis.speak(utterance);
      } else {
        speechSynthesis.cancel();
      }
      return { ...prev, [dayKey]: !currentlyPlaying };
    });
  };

  return (
    <div className="w-full mx-auto space-y-8" id="fitness-plan">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
            Your Personalized Fitness Plan
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            AI-Generated Custom Workout & Diet Plan
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <VoicePlayer plan={plan} />
          <ExportPDF />
          <Button
            onClick={onRegenerate}
            className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Motivation */}
      <section className="py-6 px-6 rounded-xl bg-gradient-to-r from-pink-300 to-purple-400 text-white shadow-lg relative overflow-hidden">
        <Heart className="absolute top-2 right-4 h-16 w-16 opacity-20 animate-pulse" />
        <h3 className="text-2xl font-bold mb-3">Daily Motivation</h3>
        <p className="text-lg italic">{plan.motivation}</p>
      </section>

      {/* Workout Plan */}
      <section className="space-y-6 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <Dumbbell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Workout Plan</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {plan.workoutPlan.map((day, idx) => {
            const dayKey = `workout-day-${idx}`;
            const dayText = day.exercises.map(e => `${e.name}: ${e.description}`).join('. ');

            return (
              <Card
                key={idx}
                className="border-0 shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800"
              >
                <CardHeader className="flex justify-between items-center py-4">
                  <CardTitle className="text-xl text-blue-900 dark:text-blue-100">{day.day}</CardTitle>
                  <Button
                    onClick={() => toggleAudio(dayKey, dayText)}
                    className={`flex items-center gap-2 text-white bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700`}
                  >
                    <Volume2 className="h-4 w-4" />
                    {playingAudio[dayKey] ? 'Stop Audio' : 'Play Audio'}
                  </Button>
                </CardHeader>
                <CardContent>
                  {day.exercises.map((exercise, exIdx) => {
                    const cardId = `exercise-${idx}-${exIdx}`;
                    const isExpanded = expandedCards[cardId];
                    const isLoading = loadingCards[cardId];
                    const hasImage = cardImages[cardId];
                    const hasError = errorCards[cardId];

                    return (
                      <div key={exIdx} className="mb-4 p-4 rounded-lg bg-white dark:bg-slate-700 shadow-sm hover:shadow-md transition-all">
                        <h4 className="font-bold text-lg">{exercise.name}</h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">{exercise.description}</p>
                        <div className="flex gap-4 text-sm mb-2">
                          <span>Sets: {exercise.sets}</span>
                          <span>Reps: {exercise.reps}</span>
                          <span>Rest: {exercise.rest}</span>
                        </div>

                        {!hasImage && (
                          <button
                            onClick={() => toggleCardImage(cardId, exercise.name, 'exercise')}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm"
                          >
                            <ImageIcon className="h-4 w-4" />
                            {isLoading ? 'Generating...' : 'Generate Image'}
                          </button>
                        )}
                        {hasError && <p className="text-red-600 mt-2">{hasError}</p>}
                        {isExpanded && hasImage && (
                          <div className="mt-3 relative">
                            <button
                              onClick={() => hideCardImage(cardId)}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <img src={cardImages[cardId]!} alt={exercise.name} className="w-full h-auto rounded-lg shadow-md cursor-pointer" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Diet Plan */}
      <section className="space-y-6 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <Utensils className="h-8 w-8 text-green-600 dark:text-green-400" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Diet Plan</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {plan.dietPlan.map((day, idx) => {
            const dayKey = `diet-day-${idx}`;
            const dayText = day.meals.map(m => `${m.name} (${m.type}): ${m.description}`).join('. ');

            return (
              <Card
                key={idx}
                className="border-0 shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1 bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900 dark:to-green-800"
              >
                <CardHeader className="flex justify-between items-center py-4">
                  <CardTitle className="text-xl text-green-900 dark:text-green-100">{day.day}</CardTitle>
                  <Button
                    onClick={() => toggleAudio(dayKey, dayText)}
                    className={`flex items-center gap-2 text-white bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700`}
                  >
                    <Volume2 className="h-4 w-4" />
                    {playingAudio[dayKey] ? 'Stop Audio' : 'Play Audio'}
                  </Button>
                </CardHeader>
                <CardContent>
                  {day.meals.map((meal, mealIdx) => {
                    const cardId = `meal-${idx}-${mealIdx}`;
                    const isExpanded = expandedCards[cardId];
                    const isLoading = loadingCards[cardId];
                    const hasImage = cardImages[cardId];
                    const hasError = errorCards[cardId];

                    return (
                      <div key={mealIdx} className="mb-4 p-4 rounded-lg bg-white dark:bg-slate-700 shadow-sm hover:shadow-md transition-all">
                        <h4 className="font-bold text-lg">{meal.name} <span className="text-sm text-gray-500">({meal.type})</span></h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">{meal.description}</p>
                        <div className="flex gap-4 text-sm mb-2">
                          <span>Protein: {meal.protein}</span>
                          <span>Carbs: {meal.carbs}</span>
                          <span>Fats: {meal.fats}</span>
                          <span>Calories: {meal.calories}</span>
                        </div>
                        {!hasImage && (
                          <button
                            onClick={() => toggleCardImage(cardId, meal.name, 'meal')}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-semibold text-sm"
                          >
                            <ImageIcon className="h-4 w-4" />
                            {isLoading ? 'Generating...' : 'Generate Image'}
                          </button>
                        )}
                        {hasError && <p className="text-red-600 mt-2">{hasError}</p>}
                        {isExpanded && hasImage && (
                          <div className="mt-3 relative">
                            <button
                              onClick={() => hideCardImage(cardId)}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <img src={cardImages[cardId]!} alt={meal.name} className="w-full h-auto rounded-lg shadow-md cursor-pointer" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
