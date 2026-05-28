/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B1418',
          secondary: '#111E24',
          tertiary: '#182A31',
        },
        brand: {
          50: '#EEF7F5',
          100: '#D8EAE7',
          200: '#B7D2CE',
          300: '#8EB4AF',
          400: '#659590',
          500: '#4A7875',
          600: '#385F5F',
          700: '#2B4B4D',
          800: '#20383D',
          900: '#17292F',
          DEFAULT: '#385F5F',
        },
        success: {
          DEFAULT: '#7BAE9A',
          light: '#9BC8B5',
          dark: '#5C8F7C',
          muted: '#7BAE9A20',
        },
        warning: {
          DEFAULT: '#D8A75F',
          light: '#E8C58F',
          dark: '#B88943',
          muted: '#D8A75F20',
        },
        error: {
          DEFAULT: '#C87171',
          light: '#D99595',
          dark: '#A95656',
          muted: '#C8717120',
        },
        text: {
          primary: '#E3E8E6',
          secondary: '#A7B6B3',
          muted: '#70837F',
          inverse: '#0B1418',
        },
        border: {
          DEFAULT: '#22373D',
          strong: '#355057',
          subtle: '#17292F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 18px 45px -32px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.035)',
        'card-hover': '0 24px 60px -34px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.055)',
        glow: '0 0 28px rgba(74,120,117,0.20)',
        'glow-amber': '0 0 24px rgba(216,167,95,0.18)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
