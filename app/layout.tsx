import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ThemeToggle from '@/components/ThemeToggle';
import ThemeInitializer from '@/components/ThemeInitializer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI Fitness Coach',
  description: 'Personalized fitness planning with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Initialize theme before render to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const stored = localStorage.getItem('fitness-store-dark-mode');
                const darkMode = stored ? JSON.parse(stored).state?.darkMode : window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (darkMode) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors`}
      >
        {/* Theme initializer component */}
        <ThemeInitializer />
        
        {children}
      </body>
    </html>
  );
}
