/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        primary: {
          1: '#FAFAFA', // Warm Off-white app bg
          2: '#FFFFFF', // Pure White for cards
          3: '#E4E4E7', // Zinc border
          4: '#71717A', // Muted text
          5: '#18181B', // Main text
          6: '#18181B', // Charcoal Obsidian primary action
        },
        secondary: {
          1: '#F4F4F5', // Zinc 100
          2: '#E4E4E7', // Zinc 200
          3: '#D4D4D8', // Zinc 300
          4: '#71717A', // Zinc 500
          5: '#3F3F46', // Zinc 700
          6: '#D97706', // Warm Amber secondary accent
          7: '#09090B', // Obsidian Black
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
