'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, VolumeX, Play, Pause, Loader2 } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState<'workout' | 'diet'>('workout');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [useBrowserTTS, setUseBrowserTTS] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [open, setOpen] = useState(false);

  const generateText = () => {
    let text = '';
    
    if (section === 'workout') {
      text = `Here is your workout plan. ${plan.workoutPlan.map((day) => 
        `${day.day}. ${day.exercises.map(ex => 
          `${ex.name}: ${ex.sets} sets of ${ex.reps} reps, rest for ${ex.rest}`
        ).join('. ')}`
      ).join('. ')}`;
    } else {
      text = `Here is your diet plan. ${plan.dietPlan.map((day) => 
        `${day.day}. ${day.meals.map(meal => 
          `For ${meal.type}, have ${meal.name}, which contains ${meal.calories} calories`
        ).join('. ')}`
      ).join('. ')}`;
    }

    return text;
  };

  const generateSpeechAPI = async () => {
    setLoading(true);
    try {
      const text = generateText();

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setUseBrowserTTS(false);
      } else {
        throw new Error('API failed');
      }
    } catch (error) {
      console.error('ElevenLabs failed, falling back to browser TTS:', error);
      setUseBrowserTTS(true);
      speakBrowserTTS();
    } finally {
      setLoading(false);
    }
  };

  const speakBrowserTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('Sorry, your browser does not support text-to-speech!');
      return;
    }

    window.speechSynthesis.cancel();
    const text = generateText();
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseBrowserTTS = () => {
    if (window.speechSynthesis.speaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  };

  const handleStopBrowserTTS = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setAudioUrl(null);
    if (useBrowserTTS) {
      handleStopBrowserTTS();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Volume2 className="mr-2 h-4 w-4" />
          Read My Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Listen to Your Plan</DialogTitle>
          <DialogDescription>
            Select which section you'd like to hear
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Section</label>
            <Select 
              value={section} 
              onValueChange={(value: 'workout' | 'diet') => {
                setSection(value);
                setAudioUrl(null);
                if (useBrowserTTS) handleStopBrowserTTS();
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workout">🏋️ Workout Plan</SelectItem>
                <SelectItem value="diet">🥗 Diet Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!audioUrl && !useBrowserTTS && (
            <Button 
              onClick={generateSpeechAPI} 
              disabled={loading} 
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Audio...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Generate Audio
                </>
              )}
            </Button>
          )}

          {audioUrl && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <audio 
                controls 
                className="w-full"
                src={audioUrl}
              >
                Your browser does not support the audio element.
              </audio>
              <p className="text-xs text-muted-foreground text-center mt-2">
                High-quality ElevenLabs voice
              </p>
            </div>
          )}

          {useBrowserTTS && (
            <div className="space-y-2">
              <div className="flex gap-2">
                {!isPlaying ? (
                  <Button onClick={speakBrowserTTS} className="flex-1">
                    <Play className="mr-2 h-4 w-4" />
                    Play
                  </Button>
                ) : (
                  <>
                    <Button onClick={handlePauseBrowserTTS} className="flex-1">
                      {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button onClick={handleStopBrowserTTS} variant="destructive" className="flex-1">
                      <VolumeX className="mr-2 h-4 w-4" />
                      Stop
                    </Button>
                  </>
                )}
              </div>
              {isPlaying && (
                <div className="p-4 border rounded-lg bg-muted/50 text-center">
                  <Volume2 className="h-5 w-5 mx-auto animate-pulse text-primary" />
                  <p className="text-sm font-medium mt-2">
                    {isPaused ? 'Paused' : 'Playing...'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Using browser TTS
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleDialogClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
