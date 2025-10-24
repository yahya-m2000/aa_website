import type { Config } from 'tailwindcss';

const config: Config = {
  // Disable dark mode - site will always be light mode
  darkMode: ['class', '[data-mode="dark"]'], // This means dark mode only activates with explicit class, not system preference
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
    './src/core/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};

export default config;
