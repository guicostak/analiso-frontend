import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
