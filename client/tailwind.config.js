/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'festival': {
          'purple': '#4A1D96',
          'blue': '#1E40AF',
          'gold': '#F59E0B',
          'dark': '#111827',
        },
        gray: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        'sun': {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // Main sun golden color
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        'earth': {
          50: '#F7F3F0',
          100: '#EDE5DC',
          200: '#D6C7B8',
          300: '#BFA894',
          400: '#A8896F', // Warm earth tone
          500: '#8B6F47',
          600: '#6F5A3A',
          700: '#5A462E',
          800: '#453722',
          900: '#2F2718',
        },
        'forest': {
          50: '#F0F9F0',
          100: '#E1F4E1',
          200: '#C2E9C2',
          300: '#94D394',
          400: '#65BD65', // Nature green
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        'spirit': {
          50: '#F8F6FF',
          100: '#F1EDFF',
          200: '#E4DCFF',
          300: '#D1C2FF',
          400: '#B794F6', // Spiritual purple
          500: '#9F7AEA',
          600: '#805AD5',
          700: '#6B46C1',
          800: '#553C9A',
          900: '#44337A',
        },
        'peace': {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8', // Peaceful sky blue
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        // Legacy colors for compatibility
        'festival-orange': '#F59E0B',
        'festival-yellow': '#FCD34D',
        'festival-green': '#22C55E',
        'festival-blue': '#38BDF8',
      },
      backgroundImage: {
        'sun-gradient': 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)',
        'earth-gradient': 'linear-gradient(135deg, #A8896F 0%, #8B6F47 50%, #6F5A3A 100%)',
        'nature-gradient': 'linear-gradient(135deg, #65BD65 0%, #22C55E 50%, #16A34A 100%)',
        'spirit-gradient': 'linear-gradient(135deg, #D1C2FF 0%, #B794F6 50%, #9F7AEA 100%)',
        'harmony-gradient': 'linear-gradient(135deg, #FCD34D 0%, #65BD65 25%, #38BDF8 50%, #B794F6 75%, #F59E0B 100%)',
        'festival-gradient': 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #22C55E 100%)',
      },
      fontFamily: {
        'earth': ['Inter', 'system-ui', 'sans-serif'],
        'spirit': ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-gentle': 'pulse-gentle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-gentle': {
          '0%, 100%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '0.8',
            transform: 'scale(1.05)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%': { 
            boxShadow: '0 0 5px #F59E0B, 0 0 10px #F59E0B, 0 0 15px #F59E0B',
          },
          '100%': { 
            boxShadow: '0 0 10px #F59E0B, 0 0 20px #F59E0B, 0 0 30px #F59E0B',
          },
        },
      },
    },
  },
  plugins: [],
} 