import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserData, FitnessPlan } from '@/types';

interface FitnessStore {
  fitnessPlan: FitnessPlan | null;
  userData: UserData | null;
  setFitnessPlan: (plan: FitnessPlan) => void;
  setUserData: (data: UserData) => void;
  clearPlan: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  initializeDarkMode: () => void;
}

export const useFitnessStore = create<FitnessStore>()(
  persist(
    (set, get) => ({
      fitnessPlan: null,
      userData: null,
      setFitnessPlan: (plan) => set({ fitnessPlan: plan }),
      setUserData: (data) => set({ userData: data }),
      clearPlan: () => set({ fitnessPlan: null, userData: null }),
      darkMode: false,

      toggleDarkMode: () => {
        const newDarkMode = !get().darkMode;
        set({ darkMode: newDarkMode });
        
        // Apply immediately to DOM
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        console.log(`Dark mode toggled to: ${newDarkMode ? 'ON' : 'OFF'}`);
      },

      setDarkMode: (isDark: boolean) => {
        set({ darkMode: isDark });
        
        // Apply immediately to DOM
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      initializeDarkMode: () => {
        // Run only on client side
        if (typeof window === 'undefined') return;

        const storedDarkMode = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let isDark = false;
        
        // Priority: stored preference > system preference > default (light)
        if (storedDarkMode !== null) {
          isDark = storedDarkMode === 'true';
        } else if (prefersDark) {
          isDark = true;
        }
        
        set({ darkMode: isDark });
        
        // Apply to DOM
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        console.log(`Dark mode initialized to: ${isDark ? 'ON' : 'OFF'}`);
      },
    }),
    {
      name: 'fitness-store',
      partialize: (state) => ({
        fitnessPlan: state.fitnessPlan,
        userData: state.userData,
        darkMode: state.darkMode,
      }),
    }
  )
);
