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
    if (section === 'workout') {
      return `Here is your workout plan. ${plan.workoutPlan.map((day) => 
        `${day.day}. ${day.exercises.map(ex => `${ex.name}: ${ex.sets} sets of ${ex.reps} reps, rest for ${ex.rest}`).join('. ')}`).join('. ')}`;
    } else {
      return `Here is your diet plan. ${plan.dietPlan.map((day) => 
        `${day.day}. ${day.meals.map(meal => `For ${meal.type}, have ${meal.name}, which contains ${meal.calories} calories`).join('. ')}`).join('. ')}`;
    }
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
        setAudioUrl(URL.createObjectURL(audioBlob));
        setUseBrowserTTS(false);
      } else throw new Error('API failed');
    } catch (error) {
      console.error('API failed, falling back to browser TTS:', error);
      setUseBrowserTTS(true);
      speakBrowserTTS();
    } finally {
      setLoading(false);
    }
  };

  const speakBrowserTTS = () => {
    if (!('speechSynthesis' in window)) return alert('Your browser does not support TTS.');
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(generateText());
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => { setIsPlaying(false); setIsPaused(false); };

    window.speechSynthesis.speak(utterance);
  };

  const togglePauseBrowserTTS = () => {
    if (!window.speechSynthesis.speaking) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const stopBrowserTTS = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setAudioUrl(null);
    if (useBrowserTTS) stopBrowserTTS();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogContent className="sm:max-w-md bg-neutral-900/90 backdrop-blur-xl border border-neutral-700 rounded-3xl shadow-2xl p-6 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Listen to Your Plan
          </DialogTitle>
          <DialogDescription className="text-neutral-400 mt-1">
            Select a section and play your personalized workout or diet plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Section Select */}
          <div>
            <label className="text-sm text-neutral-300 mb-1 block">Which part should we read?</label>
            <Select
              value={section}
              onValueChange={(value: 'workout' | 'diet') => {
                setSection(value);
                setAudioUrl(null);
                if (useBrowserTTS) stopBrowserTTS();
              }}
            >
              <SelectTrigger className="bg-neutral-800 border border-neutral-700 text-white rounded-lg">
                <SelectValue placeholder="Choose section" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border border-neutral-700">
                <SelectItem value="workout">🏋️ Workout Plan</SelectItem>
                <SelectItem value="diet">🥗 Diet Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Playback Controls */}
          {!audioUrl && !useBrowserTTS && (
            <Button
              onClick={generateSpeechAPI}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 flex justify-center items-center gap-2 text-white font-semibold"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
              {loading ? 'Generating...' : 'Generate Audio'}
            </Button>
          )}

          {/* ElevenLabs Audio */}
          {audioUrl && (
            <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700">
              <audio controls className="w-full" src={audioUrl} />
              <p className="text-xs text-neutral-400 text-center mt-2">High-quality AI voice</p>
            </div>
          )}

          {/* Browser TTS Controls */}
          {useBrowserTTS && (
            <div className="space-y-3">
              <div className="flex gap-2">
                {!isPlaying ? (
                  <Button onClick={speakBrowserTTS} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Play className="mr-2 h-4 w-4" /> Play
                  </Button>
                ) : (
                  <>
                    <Button onClick={togglePauseBrowserTTS} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button onClick={stopBrowserTTS} className="flex-1 bg-red-600 hover:bg-red-700">
                      <VolumeX className="mr-2 h-4 w-4" /> Stop
                    </Button>
                  </>
                )}
              </div>
              {isPlaying && (
                <div className="p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-center">
                  <Volume2 className="h-5 w-5 mx-auto animate-pulse text-green-400" />
                  <p className="text-sm mt-1">{isPaused ? 'Paused' : 'Playing...'}</p>
                 
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700" onClick={handleDialogClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
