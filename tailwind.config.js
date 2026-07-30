/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#14110f',
          800: '#1f1b18',
          700: '#2c2622',
        },
        sand: {
          50: '#faf7f2',
          100: '#f2ece2',
          200: '#e5dccd',
          300: '#d3c5ad',
        },
        clay: {
          400: '#b08968',
          500: '#946b4f',
          600: '#77543d',
        },
      },
    },
  },
  plugins: [],
};
