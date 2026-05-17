/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Amiri', 'Scheherazade New', 'serif'],
        sansArabic: ['Tajawal', 'system-ui', 'sans-serif'],
      },
      colors: {
        quran: {
          cream: '#f8f5ee',
          paper: '#fffdf7',
          green: '#1f6f5b',
          mint: '#dbeee5',
          gold: '#b88a2f',
          ink: '#1f2933',
        },
      },
      boxShadow: {
        soft: '0 20px 60px rgba(31, 41, 51, 0.12)',
      },
    },
  },
  plugins: [],
};
