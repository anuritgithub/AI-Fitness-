'use client';

import { useState, useEffect } from 'react';
import { Loader2, X, RotateCcw, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ImageModalProps {
  itemName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({ itemName, isOpen, onClose }: ImageModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageType, setImageType] = useState<'exercise' | 'meal'>('exercise');
  const [prompt, setPrompt] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [generationTime, setGenerationTime] = useState<number>(0);

  useEffect(() => {
    if (isOpen && itemName) {
      detectTypeAndGenerateImage();
    }
  }, [isOpen, itemName]);

  // Detect if it's an exercise or meal
  const detectTypeAndGenerateImage = () => {
    const exerciseKeywords = [
      'squat', 'push', 'pull', 'curl', 'press', 'run', 'jump', 'dumbbell',
      'barbell', 'row', 'plank', 'bench', 'lunge', 'deadlift', 'walk',
      'sprint', 'climb', 'crunch', 'raise', 'fly', 'burpee', 'mountain',
      'climber', 'twist', 'bridge', 'extension', 'dip', 'pullup', 'chinup',
      'situp', 'bicycle', 'leg', 'arm', 'shoulder', 'back', 'chest', 'core',
    ];

    const isExercise = exerciseKeywords.some(keyword =>
      itemName.toLowerCase().includes(keyword)
    );

    const detectedType = isExercise ? 'exercise' : 'meal';
    setImageType(detectedType);

    // Generate image after setting type
    setTimeout(() => generateImage(detectedType), 100);
  };

  const generateImage = async (type?: 'exercise' | 'meal') => {
    const currentType = type || imageType;
    setLoading(true);
    setError(null);
    setImageUrl(null);
    setGenerationTime(0);

    const startTime = Date.now();

    try {
      console.log(`Generating ${currentType} image for: ${itemName}`);
      console.log(`Using OpenRouter API...`);

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: itemName,
          itemName,
          type: currentType,
        }),
      });

      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000; // Convert to seconds
      setGenerationTime(timeTaken);

      const data = await response.json();

      if (data.success && data.imageUrl) {
        console.log(`Image generated successfully in ${timeTaken.toFixed(1)}s`);
        setImageUrl(data.imageUrl);
        setPrompt(data.prompt || '');
        setModel(data.model || 'OpenRouter API');
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (err: any) {
      console.error('Error generating image:', err);
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    generateImage(imageType);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {imageType === 'exercise' ? '🏋️' : '🥗'} {itemName}
            </span>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            AI-generated using OpenRouter (GPT-4 Vision)
            {imageType === 'exercise' ? ' exercise form guide' : ' meal presentation'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-16 h-16 mb-4">
                <Loader2 className="h-full w-full animate-spin text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 text-center font-medium mb-2">
                Generating {imageType === 'exercise' ? 'workout' : 'meal'} image...
              </p>
              <p className="text-xs text-gray-500 text-center">
                OpenRouter • Free tier • AI-powered image generation
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-bold mb-2">
                Error Generating Image
              </p>
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <div className="space-y-2">
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <p className="text-xs text-red-500">
                  Tip: Make sure you have free credits remaining in your OpenRouter account
                </p>
              </div>
            </div>
          )}

          {/* Image State */}
          {imageUrl && !loading && (
            <div className="space-y-3">
              <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={imageUrl}
                  alt={itemName}
                  className="w-full h-auto object-contain max-h-96"
                  onError={() => {
                    setError('Failed to load image');
                    setImageUrl(null);
                  }}
                />
              </div>

              {/* Generation Info */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-blue-50 p-2 rounded border border-blue-200">
                  <p className="text-blue-700 font-semibold">Model</p>
                  <p className="text-blue-600 truncate">{model.split('/')[1] || 'GPT-4V'}</p>
                </div>
                <div className="bg-green-50 p-2 rounded border border-green-200">
                  <p className="text-green-700 font-semibold">Time</p>
                  <p className="text-green-600">{generationTime.toFixed(1)}s</p>
                </div>
                <div className="bg-purple-50 p-2 rounded border border-purple-200">
                  <p className="text-purple-700 font-semibold">Type</p>
                  <p className="text-purple-600 capitalize">{imageType}</p>
                </div>
              </div>

              {prompt && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1">
                    Prompt Used:
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-3">
                    {prompt}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!imageUrl && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-5xl mb-3">
                {imageType === 'exercise' ? '🏋️' : '🥗'}
              </div>
              <p className="text-sm text-gray-600 text-center mb-2">
                Loading {imageType === 'exercise' ? 'exercise' : 'meal'} image...
              </p>
              <Button
                onClick={handleRegenerate}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generate Image
              </Button>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-xs text-blue-700">
            <p className="font-semibold mb-1"> Powered by OpenRouter (Free Tier)</p>
            <p className="mb-2">
              {imageType === 'exercise'
                ? '✓ This shows proper exercise form and technique. Always consult a trainer for personalized guidance.'
                : '✓ This is an AI representation of the meal. Actual nutrition and appearance may vary by recipe.'}
            </p>
            <p className="text-xs text-blue-600">
              Using GPT-4 Vision for high-quality image generation
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}




