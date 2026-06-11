/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Ink & Acid — cool graphite UI, acid lime accent. Dark everywhere.
        ink: '#F4F6F0', // primary TEXT color (light on dark)
        canvas: '#101113', // page background
        panel: '#16181C', // sidebar / section background
        card: '#1A1D22', // raised surfaces
        accent: '#C6F24E', // acid lime
        'accent-ink': '#11130A', // text on accent fills
        hairline: '#272B31', // borders on dark
        muted: '#A3A8A0', // secondary text
        faint: '#6E736C', // tertiary text / metadata
        'apple-blue': '#007AFF',
        'apple-gray': '#F2F2F7',
      },
    },
  },
  plugins: [],
}