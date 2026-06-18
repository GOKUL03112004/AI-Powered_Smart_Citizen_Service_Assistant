/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fdfbf7',
          100: '#fcf6ec',
          200: '#f7ead1',
          300: '#f0d9b1',
          400: '#e6c38a',
          500: '#dba960',
          600: '#cd8e41',
          700: '#aa7033',
          800: '#895a2d',
          900: '#6f4a27',
          950: '#3d2612',
        },
        gov: {
          navy: '#4a3b32',
          blue: '#b2895e',
          teal: '#8a9a86',
          amber: '#c18c4b',
          red: '#b56a5c',
          green: '#76805d',
        },
        neutral: {
          50: '#faf9f8',
          100: '#f4f2ef',
          200: '#e7e3dc',
          300: '#d5cfc5',
          400: '#b8b0a3',
          500: '#9e9484',
          600: '#867a69',
          700: '#706456',
          800: '#5c5248',
          900: '#4b433c',
          950: '#28231f',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-dot': 'bounceDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.3' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 2px 12px 0 rgba(0,0,0,0.06), 0 1px 3px 0 rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px 0 rgba(0,0,0,0.10), 0 2px 6px 0 rgba(0,0,0,0.06)',
        'nav': '0 1px 0 0 rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
