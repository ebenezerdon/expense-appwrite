import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e'
        },
        accent: {
          300: '#d8b4fe',
          500: '#a855f7',
          600: '#9333ea'
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717'
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444'
      }
    }
  },
  plugins: []
};
