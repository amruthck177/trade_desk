/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          primary: '#080C1A',
          secondary: '#0D1326',
          card: '#121B30',
          surface: '#1A2642',
          border: '#243254',
          subtle: '#33446C',
        },
        primary: {
          DEFAULT: '#F97316',
          hover: '#EA580C',
          light: '#FFEDD5',
        },
        accent: {
          cyan: '#06B6D4',
          purple: '#A855F7',
          gold: '#F59E0B',
        },
        secondary: '#38BDF8',
        success: '#22C55E',
        warning: '#FACC15',
        danger: '#EF4444',
        text: {
          primary: '#F8FAFC',
          secondary: '#CBD5E1',
          muted: '#94A3B8',
        },
        textPrimary: '#F8FAFC',
        textSecondary: '#CBD5E1',
        textMuted: '#94A3B8',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['Syne', '"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'input': '12px',
        'card': '18px',
        'modal': '24px',
        'button': '14px',
        'badge': '999px',
      },
      boxShadow: {
        'card-glow': '0 12px 36px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'orange-glow': '0 0 35px rgba(249, 115, 22, 0.35)',
        'orange-glow-lg': '0 0 60px rgba(249, 115, 22, 0.5)',
        'neon-green': '0 0 25px rgba(34, 197, 94, 0.35)',
        'neon-gold': '0 0 30px rgba(245, 158, 11, 0.4)',
        'paper': '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 1px rgba(255, 255, 255, 0.8)',
        'elevated': '0 24px 48px rgba(0, 0, 0, 0.65)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 5s ease-in-out infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite linear',
        'glow-pulse': 'glowPulse 2s infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%': { opacity: '0.4', transform: 'scale(0.98)' },
          '100%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1.0)' },
        },
      }
    },
  },
  plugins: [],
}
