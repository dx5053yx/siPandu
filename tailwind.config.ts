import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefbf3',
          100: '#d6f5e1',
          200: '#b0eac8',
          300: '#7cd9a8',
          400: '#46c283',
          500: '#22a867',
          600: '#16a34a',
          700: '#12833d',
          800: '#126733',
          900: '#10552b',
          950: '#052f18',
        },
        surface: {
          50: '#f5fbf7',
          100: '#eaf7ef',
          200: '#d8eadf',
          300: '#c2d9cb',
          400: '#9bbaa6',
          500: '#7a9f88',
          600: '#5a7e6a',
          700: '#476354',
          800: '#3a5044',
          900: '#324339',
          950: '#10231a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        card: '0 20px 70px rgba(16,35,26,.08)',
        'card-hover': '0 24px 80px rgba(16,35,26,.12)',
        glow: '0 0 40px rgba(22,163,74,.15)',
      },
    },
  },
  plugins: [],
};

export default config;
