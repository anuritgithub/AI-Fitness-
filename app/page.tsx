'use client';

import { useState } from 'react';
import UserForm from '@/components/UserForm';
import PlanDisplay from '@/components/PlanDisplay';
import ThemeToggle from '@/components/ThemeToggle';
import MotivationQuote from '@/components/MotivationQuote';
import { useFitnessStore } from '@/lib/store';
import { UserData, FitnessPlan } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { fitnessPlan, setFitnessPlan, setUserData, clearPlan } = useFitnessStore();
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (userData: UserData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (data.success) {
        setUserData(userData);
        setFitnessPlan(data.plan);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    // Implement regenerate logic
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">💪 AI Fitness Coach 🤛</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!fitnessPlan ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <MotivationQuote />
            <UserForm onSubmit={handleFormSubmit} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Button variant="ghost" onClick={clearPlan}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Start Over
            </Button>
            <PlanDisplay plan={fitnessPlan} onRegenerate={handleRegenerate} />
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>Built with Next.js, Gemini AI, and ElevenLabs(optional)</p>
        </div>
      </footer>
    </main>
  );
}
