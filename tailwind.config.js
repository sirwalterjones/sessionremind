/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Theme is driven by data-theme on <html> (set pre-paint in app/layout.tsx,
  // persisted in localStorage by components/ThemeToggle.tsx). Light is default.
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      // Readability: nearly all body copy on the site is set in text-sm/text-xs,
      // which at Tailwind's defaults (14px/12px) is hard to read on phones.
      // Lift the small end of the scale once here instead of editing 400+
      // call sites.
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.3rem' }], // 13px (Tailwind default: 12px)
        sm: ['0.9375rem', { lineHeight: '1.5rem' }], // 15px (Tailwind default: 14px)
      },
      colors: {
        // Semantic tokens — RGB triplets live in globals.css per theme.
        // `ink` is always the PRIMARY TEXT color (dark on light, light on dark).
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        panel: 'rgb(var(--c-panel) / <alpha-value>)',
        card: 'rgb(var(--c-card) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        'accent-ink': 'rgb(var(--c-accent-ink) / <alpha-value>)',
        hairline: 'rgb(var(--c-hairline) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        faint: 'rgb(var(--c-faint) / <alpha-value>)',
        'apple-blue': '#007AFF',
        'apple-gray': '#F2F2F7',
      },
      boxShadow: {
        // Accent hover glow that follows the theme.
        glow: '0 0 30px -5px rgb(var(--c-accent) / 0.5)',
      },
    },
  },
  plugins: [],
}
