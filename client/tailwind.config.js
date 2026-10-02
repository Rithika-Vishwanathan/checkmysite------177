/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        burgundy: '#7A1020',
        'dark-burgundy': '#5A0714',
        'light-burgundy': '#F8E9EC',
        text: '#171717',
        muted: '#6B7280',
        border: '#E5E7EB',
        surface: '#F7F7F7',
      },
    },
  },
  plugins: [],
};
