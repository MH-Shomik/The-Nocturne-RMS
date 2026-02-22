/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        foreground: '#F5F5F1',
        brand: {
          red: '#991B1B', // Deep red
          orange: '#EA580C', // Warm orange
          gold: '#FBBF24', // Gold
        },
        // Legacy tokens used by DietaryMenuPage
        'deep-black':   '#080604',
        'light-gray':   '#F5F5F1',
        'warm-beige':   '#C4A882',
        'accent-gold':  '#FBBF24',
        'accent-orange':'#EA580C',
        'fresh-green':  '#22C55E',
        'warm-brown':   '#2D2015',
        'alert-red':    '#DC2626',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-ember': 'linear-gradient(to right, #991B1B, #EA580C, #FBBF24)',
        'gradient-radial-warm': 'radial-gradient(circle, rgba(234,88,12,0.15) 0%, rgba(10,10,10,0) 70%)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-danger': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(220,38,38,0.8), 0 0 12px rgba(220,38,38,0.4)',
            borderColor: 'rgba(220,38,38,0.7)',
          },
          '50%': {
            boxShadow: '0 0 0 5px rgba(220,38,38,0.0), 0 0 32px rgba(220,38,38,0.55)',
            borderColor: 'rgba(255,60,60,1)',
          },
        },
        'slide-in-col': {
          '0%':   { opacity: '0', transform: 'translateY(-16px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0)   scale(1)'    },
        },
      },
      animation: {
        'fade-in-up':    'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-danger':  'pulse-danger 1.6s ease-in-out infinite',
        'slide-in-col':  'slide-in-col 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}