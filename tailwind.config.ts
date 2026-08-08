import type { Config } from 'tailwindcss';

// Note: this config file is NOT auto-loaded by Tailwind v4 (no @config directive in
// globals.css) — `content`/`darkMode` here are currently inert. Admin CMS animations use
// hand-rolled native CSS in globals.css instead of a JS plugin, since tailwindcss-animate's
// v3-style plugin() API isn't reliably compatible with v4's engine regardless.
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
