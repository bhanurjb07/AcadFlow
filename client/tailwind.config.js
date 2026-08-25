/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a', // a deep blue
        accent: '#f59e0b', // amber
        background: '#f3f4f6',
        surface: '#ffffff',
        "background-dark": '#111827',
        "surface-dark": '#1f2937',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
