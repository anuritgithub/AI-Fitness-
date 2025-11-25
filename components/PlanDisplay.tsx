'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FitnessPlan } from '@/types';
import { Dumbbell, Utensils, Lightbulb, Heart, RefreshCw, Image as ImageIcon, X } from 'lucide-react';
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

  const handleItemClick = (itemName: string) => {
    setSelectedItem(itemName);
    setShowImageModal(true);
  };

  const toggleCardImage = async (cardId: string, itemName: string, type: 'exercise' | 'meal') => {
    // Clear any previous errors
    setErrorCards(prev => ({
      ...prev,
      [cardId]: null
    }));

    // Start loading
    setLoadingCards(prev => ({
      ...prev,
      [cardId]: true
    }));

    // Clear previous image from this card before generating new one
    setCardImages(prev => ({
      ...prev,
      [cardId]: null
    }));

    try {
      console.log(`Generating ${type} image for: ${itemName}`);

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: itemName,
          itemName,
          type,
        }),
      });

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType);
        throw new Error('Invalid response from server');
      }

      const data = await response.json();

      if (data.success && data.imageUrl) {
        console.log('Image generated successfully');
        
        // Set the image URL (can be URL or base64 data)
        setCardImages(prev => ({
          ...prev,
          [cardId]: data.imageUrl
        }));
        
        // Expand the card to show image
        setExpandedCards(prev => ({
          ...prev,
          [cardId]: true
        }));
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      
      // Store error message for this card
      setErrorCards(prev => ({
        ...prev,
        [cardId]: error.message
      }));
      
      // Reset state on error
      setCardImages(prev => ({
        ...prev,
        [cardId]: null
      }));
      setExpandedCards(prev => ({
        ...prev,
        [cardId]: false
      }));
    } finally {
      // Stop loading
      setLoadingCards(prev => ({
        ...prev,
        [cardId]: false
      }));
    }
  };

  const hideCardImage = (cardId: string) => {
    // Hide the image container
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: false
    }));
    
    // Clear the image data
    setCardImages(prev => ({
      ...prev,
      [cardId]: null
    }));
    
    // Clear any errors
    setErrorCards(prev => ({
      ...prev,
      [cardId]: null
    }));
  };

  return (
    <div className="w-full mx-auto space-y-6" id="fitness-plan">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
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
            variant="outline"
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </div>

      {/* PDF Content Section */}
      <div id="fitness-plan-content" className="space-y-8">

        {/* Motivation Section */}
        <section className="py-6 px-4 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800 rounded-lg text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="h-6 w-6" />
            <h3 className="text-2xl font-bold">Daily Motivation</h3>
          </div>
          <p className="text-lg italic leading-relaxed">
            {plan.motivation}
          </p>
        </section>

        {/* Workout Plan Section */}
        <section className="space-y-4">
          <div className="border-b-2 border-blue-500 pb-3 mb-6">
            <div className="flex items-center gap-3">
              <Dumbbell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Workout Plan (7 Days)
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Personalized exercises tailored to your fitness level and goals
            </p>
          </div>

          <div className="space-y-5">
            {plan.workoutPlan.map((day, idx) => (
              <Card 
                key={idx}
                className="border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-white dark:bg-slate-800"
              >
                <CardHeader className="bg-blue-50 dark:bg-blue-900 py-4">
                  <CardTitle className="text-xl text-blue-900 dark:text-blue-100">
                    {day.day}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {day.exercises.map((exercise, exIdx) => {
                      const cardId = `exercise-${idx}-${exIdx}`;
                      const isExpanded = expandedCards[cardId];
                      const isLoading = loadingCards[cardId];
                      const hasImage = cardImages[cardId];
                      const hasError = errorCards[cardId];

                      return (
                        <div
                          key={exIdx}
                          className={`p-4 bg-gray-50 dark:bg-slate-700 border-l-4 border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-600 transition-all ${
                            isExpanded ? 'ring-2 ring-blue-300 dark:ring-blue-500' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                {exercise.name}
                              </h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                                {exercise.description}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                            <div className="bg-white dark:bg-slate-600 p-2 rounded border border-gray-300 dark:border-slate-500">
                              <span className="font-semibold text-blue-600 dark:text-blue-400">Sets:</span>
                              <p className="text-gray-900 dark:text-white">{exercise.sets}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-600 p-2 rounded border border-gray-300 dark:border-slate-500">
                              <span className="font-semibold text-blue-600 dark:text-blue-400">Reps:</span>
                              <p className="text-gray-900 dark:text-white">{exercise.reps}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-600 p-2 rounded border border-gray-300 dark:border-slate-500">
                              <span className="font-semibold text-blue-600 dark:text-blue-400">Rest:</span>
                              <p className="text-gray-900 dark:text-white">{exercise.rest}</p>
                            </div>
                          </div>

                          {/* Generate Image Button - Hidden when image is displayed */}
                          {!hasImage && !isExpanded && (
                            <button
                              onClick={() => toggleCardImage(cardId, exercise.name, 'exercise')}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-sm transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ImageIcon className="h-4 w-4" />
                              {isLoading ? 'Generating...' : 'Generate Image'}
                            </button>
                          )}

                          {/* Error Display */}
                          {hasError && !isLoading && (
                            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                              <p className="text-sm text-red-700 dark:text-red-300">
                                {hasError}
                              </p>
                              <button
                                onClick={() => toggleCardImage(cardId, exercise.name, 'exercise')}
                                className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
                              >
                                Try Again
                              </button>
                            </div>
                          )}

                          {/* Image Preview Container - Hidden by default, visible after generation */}
                          {isExpanded && hasImage && (
                            <div 
                              id={`imagePreview-${cardId}`}
                              className="mt-4 pt-4 border-t-2 border-blue-200 dark:border-blue-700 relative"
                            >
                              <button
                                onClick={() => hideCardImage(cardId)}
                                className="absolute top-6 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                                title="Hide Image"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <img
                                src={cardImages[cardId]!}
                                alt={exercise.name}
                                className="w-full h-auto rounded-lg border-2 border-blue-300 dark:border-blue-500 object-cover max-h-96 cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => hideCardImage(cardId)}
                                onError={() => {
                                  setErrorCards(prev => ({
                                    ...prev,
                                    [cardId]: 'Failed to load image'
                                  }));
                                  hideCardImage(cardId);
                                }}
                              />
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                AI-generated exercise form guide • Click image or X to hide
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="page-break" style={{ height: '20px' }}></div>

        {/* Diet Plan Section */}
        <section className="space-y-4">
          <div className="border-b-2 border-green-500 pb-3 mb-6">
            <div className="flex items-center gap-3">
              <Utensils className="h-8 w-8 text-green-600 dark:text-green-400" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Diet Plan (7 Days)
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Balanced meal plan matched to your dietary preferences and caloric needs
            </p>
          </div>

          <div className="space-y-5">
            {plan.dietPlan.map((day, idx) => (
              <Card 
                key={idx}
                className="border-2 border-green-200 dark:border-green-700 hover:border-green-400 dark:hover:border-green-500 transition-colors bg-white dark:bg-slate-800"
              >
                <CardHeader className="bg-green-50 dark:bg-green-900 py-4">
                  <CardTitle className="text-xl text-green-900 dark:text-green-100">
                    {day.day}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {day.meals.map((meal, mealIdx) => {
                      const cardId = `meal-${idx}-${mealIdx}`;
                      const isExpanded = expandedCards[cardId];
                      const isLoading = loadingCards[cardId];
                      const hasImage = cardImages[cardId];
                      const hasError = errorCards[cardId];

                      return (
                        <div
                          key={mealIdx}
                          className={`p-4 bg-gray-50 dark:bg-slate-700 border-l-4 border-green-500 rounded-lg hover:bg-green-50 dark:hover:bg-slate-600 transition-all ${
                            isExpanded ? 'ring-2 ring-green-300 dark:ring-green-500' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="inline-block bg-green-100 dark:bg-green-800 px-3 py-1 rounded-full mb-2">
                                <h4 className="font-bold text-sm text-green-700 dark:text-green-200 capitalize">
                                  {meal.type}
                                </h4>
                              </div>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {meal.name}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                {meal.calories}
                              </span>
                              <p className="text-xs text-gray-600 dark:text-gray-400">cal</p>
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                            {meal.description}
                          </p>

                          <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                            <div className="bg-white dark:bg-slate-600 p-2 rounded border border-gray-300 dark:border-slate-500">
                              <span className="font-semibold text-green-600 dark:text-green-400">Protein</span>
                              <p className="text-gray-900 dark:text-white">{meal.protein}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-600 p-2 rounded border border-gray-300 dark:border-slate-500">
                              <span className="font-semibold text-green-600 dark:text-green-400">Carbs</span>
                              <p className="text-gray-900 dark:text-white">{meal.carbs}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-600 p-2 rounded border border-gray-300 dark:border-slate-500">
                              <span className="font-semibold text-green-600 dark:text-green-400">Fats</span>
                              <p className="text-gray-900 dark:text-white">{meal.fats}</p>
                            </div>
                          </div>

                          {/* Generate Image Button - Hidden when image is displayed */}
                          {!hasImage && !isExpanded && (
                            <button
                              onClick={() => toggleCardImage(cardId, meal.name, 'meal')}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-semibold text-sm transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ImageIcon className="h-4 w-4" />
                              {isLoading ? 'Generating...' : 'Generate Image'}
                            </button>
                          )}

                          {/* Error Display */}
                          {hasError && !isLoading && (
                            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                              <p className="text-sm text-red-700 dark:text-red-300">
                                {hasError}
                              </p>
                              <button
                                onClick={() => toggleCardImage(cardId, meal.name, 'meal')}
                                className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
                              >
                                Try Again
                              </button>
                            </div>
                          )}

                          {/* Image Preview Container - Hidden by default, visible after generation */}
                          {isExpanded && hasImage && (
                            <div 
                              id={`imagePreview-${cardId}`}
                              className="mt-4 pt-4 border-t-2 border-green-200 dark:border-green-700 relative"
                            >
                              <button
                                onClick={() => hideCardImage(cardId)}
                                className="absolute top-6 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                                title="Hide Image"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <img
                                src={cardImages[cardId]!}
                                alt={meal.name}
                                className="w-full h-auto rounded-lg border-2 border-green-300 dark:border-green-500 object-cover max-h-96 cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => hideCardImage(cardId)}
                                onError={() => {
                                  setErrorCards(prev => ({
                                    ...prev,
                                    [cardId]: 'Failed to load image'
                                  }));
                                  hideCardImage(cardId);
                                }}
                              />
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                AI-generated meal presentation • Click image or X to hide
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="page-break" style={{ height: '20px' }}></div>

        {/* Tips & Advice Section */}
        <section className="space-y-4">
          <div className="border-b-2 border-yellow-500 pb-3 mb-6">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Expert Tips & Lifestyle Advice
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Professional recommendations for optimal fitness results
            </p>
          </div>

          <Card className="border-2 border-yellow-200 dark:border-yellow-700 bg-white dark:bg-slate-800">
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {plan.tips.map((tip, idx) => (
                  <li 
                    key={idx} 
                    className="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border-l-4 border-yellow-500"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed flex-1">
                      {tip}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Footer Section */}
        <section className="mt-12 pt-8 border-t-2 border-gray-300 dark:border-gray-600 text-center bg-gray-50 dark:bg-slate-800 p-6 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Powered by AI Fitness Coach • Personalized Fitness Planning
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            For best results, follow the plan consistently and stay hydrated!
          </p>
        </section>

      </div>

      {/* Image Modal */}
      {showImageModal && selectedItem && (
        <ImageModal
          itemName={selectedItem}
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
}
