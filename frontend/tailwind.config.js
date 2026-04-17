/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        bg: '#0A0A0F',
        surface: '#13131A',
        'surface-elevated': '#1C1C27',
        critical: '#EF4444',
        high: '#F97316',
        medium: '#EAB308',
        low: '#22C55E',
        'text-primary': '#F1F5F9',
        'text-secondary': '#94A3B8',
        'nexus-glow': '#A855F7',
        // Agent theme colors
        'agent-cognos': '#06B6D4',
        'agent-vira': '#EC4899',
        'agent-commander': '#10B981',
        'agent-fleet': '#3B82F6',
        'agent-sentinel': '#EF4444',
        'agent-loop': '#059669',
        'agent-guardian': '#F59E0B',
        'agent-prescient': '#8B5CF6',
        'agent-oracle': '#D97706',
        'agent-field-copilot': '#14B8A6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
