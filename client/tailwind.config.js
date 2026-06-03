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
          primary: '#0A0F1E',
          card: '#111827',
          elevated: '#1A2235',
          border: '#1F2937',
        },
        primary: {
          DEFAULT: '#F97316',
          hover: '#EA580C',
        },
        secondary: '#3B82F6',
        success: '#22C55E',
        warning: '#FACC15',
        danger: '#EF4444',
        text: {
          primary: '#F9FAFB',
          secondary: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'input': '12px',
        'card': '16px',
        'modal': '20px',
        'button': '14px',
        'badge': '999px',
      },
      boxShadow: {
        'card-glow': '0 8px 32px rgba(0, 0, 0, 0.35)',
        'orange-glow': '0 20px 60px rgba(249, 115, 22, 0.15)',
        'elevated': '0 20px 40px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite linear',
        'drawer-up': 'slideUp 0.3s ease-out forwards',
        'drawer-down': 'slideDown 0.3s ease-in forwards',
        'shake': 'shake 0.4s ease-in-out',
        'draw-check': 'drawCheck 0.6s ease-in-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1.0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: '200px 0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        drawCheck: {
          '0%': { strokeDashoffset: '48' },
          '100%': { strokeDashoffset: '0' },
        }
      }
    },
  },
  plugins: [],
}
