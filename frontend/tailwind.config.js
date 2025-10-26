/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        secondary: '#fbbf24',
        dark: '#0f172a',
        mystic: '#312e81',
        'mystic-purple': '#6366f1',
        'mystic-blue': '#3b82f6',
        'mystic-gold': '#f59e0b',
      },
      backgroundImage: {
        'gradient-mystic': 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
        'gradient-cosmic': 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'rotate-slow': 'rotate 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.3)', opacity: '0' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
