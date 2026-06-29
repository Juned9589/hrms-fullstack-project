/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        accent: '#D4AF37',
        'accent-soft': '#FFF7D6',
        surface: '#F8FAFC',
        ink: '#0F172A',
        border: 'rgba(255,255,255,0.6)',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideIn: {
          from: { transform: 'scaleY(0)' },
          to: { transform: 'scaleY(1)' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-8deg)' },
          '75%': { transform: 'rotate(8deg)' },
        },
        pulsering: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(37,99,235,0.22)' },
          '50%': { boxShadow: '0 0 0 12px rgba(37,99,235,0)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.4s ease-out forwards',
        scaleIn: 'scaleIn 0.2s ease-out forwards',
        slideIn: 'slideIn 0.2s ease-out forwards',
        wiggle: 'wiggle 0.4s ease-in-out',
        pulsering: 'pulsering 2s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [],
};
