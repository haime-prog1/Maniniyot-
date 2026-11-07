/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', '"SF Pro Display"', '"SF Pro Text"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { glass: '24px' },
      colors: {
        ig: { yellow: '#feda75', orange: '#fa7e1e', pink: '#d62976', purple: '#962fbf', blue: '#4f5bd5' },
      },
      backgroundImage: {
        ig: 'linear-gradient(45deg, #feda75 0%, #fa7e1e 25%, #d62976 50%, #962fbf 75%, #4f5bd5 100%)',
      },
    },
  },
  plugins: [],
};
