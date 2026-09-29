/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        kiot: {
          maroon: '#800000',
          darkmaroon: '#5b0000',
          crimson: '#9b1c1c',
          navy: '#0f172a',
          blue: '#1e3a8a',
          gold: '#f59e0b',
          amber: '#d97706',
          lightgold: '#fef3c7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
