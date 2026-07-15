/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#050505',
        carbon: '#0b0b0d',
        graphite: '#15151a',
        gold: '#d6a83a',
        champagne: '#f4d37a',
      },
      boxShadow: {
        glow: '0 0 50px rgba(214, 168, 58, 0.22)',
        panel: '0 18px 70px rgba(0, 0, 0, 0.45)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        radialgold: 'radial-gradient(circle at top, rgba(214,168,58,.24), transparent 35%)',
      },
    },
  },
  plugins: [],
};
