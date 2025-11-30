'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { generateMotivationQuote } from '@/lib/gemini.server';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MotivationQuote() {
  const [quote, setQuote] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuote();
  }, []);

  const loadQuote = async () => {
    setLoading(true);
    try {
      const newQuote = await generateMotivationQuote();
      setQuote(newQuote);
    } catch (error) {
      setQuote('Your only limit is you! 💪');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-white border border-white/20 animate-gradient-x">
      <CardContent className="pt-6 pb-4 px-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 animate-pulse text-yellow-300" />
          <p className="text-lg font-semibold italic leading-relaxed">{quote}</p>
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadQuote} 
            disabled={loading}
            className="text-white border-white/50 hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'New Quote'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
