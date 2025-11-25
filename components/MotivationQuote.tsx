'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { generateMotivationQuote } from '@/lib/gemini.server';
import { Sparkles } from 'lucide-react';

export default function MotivationQuote() {
  const [quote, setQuote] = useState<string>('');

  useEffect(() => {
    loadQuote();
  }, []);

  const loadQuote = async () => {
    try {
      const newQuote = await generateMotivationQuote();
      setQuote(newQuote);
    } catch (error) {
      setQuote('Your only limit is you!');
    }
  };

  return (
    <Card className="bg-gradient-to-r from-orange-400 to-pink-600 text-white">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6" />
          <p className="text-lg font-semibold italic">{quote}</p>
        </div>
      </CardContent>
    </Card>
  );
}
