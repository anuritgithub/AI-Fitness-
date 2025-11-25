'use client';

import { useEffect } from 'react';
import { useFitnessStore } from '@/lib/store';

export default function ThemeInitializer() {
  const initializeDarkMode = useFitnessStore((state) => state.initializeDarkMode);

  useEffect(() => {
    // Initialize on app load
    initializeDarkMode();
  }, [initializeDarkMode]);

  return null; // This component doesn't render anything
}
