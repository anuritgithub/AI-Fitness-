'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { FitnessPlan } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface VoicePlayerProps {
  plan: FitnessPlan;
}

export default function VoicePlayer({ plan }: VoicePlayerProps) {
  const [section, setSection] = useState<'workout' | 'diet'>('workout');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const generateText = (): string => {
    let text = '';
    
    if (section === 'workout') {
      text = `Your personalized workout plan. ${plan.workoutPlan
        .map(
          (day) =>
            `${day.day}. ${day.exercises
              .map(
                (ex) =>
                  `${ex.name}: ${ex.sets} sets of ${ex.reps} reps, rest for ${ex.rest}. ${ex.description}`
              )
              .join('. ')}`
        )
        .join('. ')}`;
    } else {
      text = `Your personalized diet plan. ${plan.dietPlan
        .map(
          (day) =>
            `${day.day}. ${day.meals
              .map(
                (meal) =>
                  `For ${meal.type}, have ${meal.name}. ${meal.description} Contains ${meal.calories} calories. Protein: ${meal.protein}, Carbs: ${meal.carbs}, Fats: ${meal.fats}`
              )
              .join('. ')}`
        )
        .join('. ')}`;
    }

    return text;
  };

  const speak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const text = generateText();
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find(
          (voice) =>
            (voice.lang.startsWith('en') && voice.name.includes('Google')) ||
            voice.name.includes('Male')
        ) || voices.find((voice) => voice.lang.startsWith('en'));

      if (englishVoice) utterance.voice = englishVoice;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      utterance.onpause = () => setIsPaused(true);
      utterance.onresume = () => setIsPaused(false);
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentUtterance(null);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      setCurrentUtterance(utterance);
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      alert('Error starting text-to-speech');
    }
  };

  const pause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentUtterance(null);
  };

  const handleDialogClose = () => {
    stop();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl shadow-lg hover:brightness-110 transition-all">
          <Volume2 className="h-4 w-4" />
          Listen to My Plan
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-neutral-900/80 backdrop-blur-xl border border-neutral-700 rounded-2xl shadow-2xl p-6 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Listen to Your Plan
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Using browser-based text-to-speech. No API usage or limits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">

          {/* Select Section */}
          <div>
            <label className="text-sm text-neutral-300">Select Section</label>
            <Select
              value={section}
              onValueChange={(value: 'workout' | 'diet') => {
                setSection(value);
                stop();
              }}
              disabled={isPlaying}
            >
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700">
                <SelectItem value="workout">🏋️ Workout Plan</SelectItem>
                <SelectItem value="diet">🥗 Diet Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Playback */}
          <div className="flex flex-col gap-3">
            {!isPlaying ? (
              <Button
                onClick={speak}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 text-white font-semibold shadow-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Play
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={isPaused ? resume : pause}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
                >
                  {isPaused ? (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="mr-2 h-5 w-5" />
                      Pause
                    </>
                  )}
                </Button>

                <Button
                  onClick={stop}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md"
                >
                  <VolumeX className="mr-2 h-5 w-5" />
                  Stop
                </Button>
              </div>
            )}
          </div>

          {/* Status Bar */}
          {isPlaying && (
            <div className="p-4 bg-green-600/10 border border-green-500 rounded-xl text-center shadow-inner">
              <div className="flex justify-center items-center gap-2">
                <Volume2 className="h-5 w-5 text-green-400 animate-pulse" />
                <span className="font-semibold text-green-300">
                  {isPaused ? 'Paused' : 'Playing...'}
                </span>
              </div>
              <p className="text-xs text-green-400 mt-1">
                Browser Text-to-Speech Active
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-600/10 border border-blue-500 rounded-xl shadow-inner">
            <p className="text-sm text-blue-300">
              This uses built-in browser speech synthesis. No API keys or costs.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            className="bg-neutral-800 border-neutral-600 text-white rounded-xl hover:bg-neutral-700"
            onClick={handleDialogClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
