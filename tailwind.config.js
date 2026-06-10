export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#faf9f6',
          100: '#f2efe8',
          200: '#e2ddd2',
          300: '#cbc3b4',
          400: '#a59b8b',
          500: '#7d7468',
          600: '#5f574e',
          700: '#49433c',
          800: '#302d29',
          900: '#24221f',
          950: '#191816',
        },
        emerald: {
          50: '#fbf7eb',
          100: '#f5ebcb',
          200: '#ead69a',
          300: '#ddbd62',
          400: '#cfa94f',
          500: '#c5a451',
          600: '#a98535',
          700: '#846626',
          800: '#694f22',
          900: '#59431f',
          950: '#30230d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 45px rgba(48, 35, 13, 0.09)',
      },
    },
  },
  plugins: [],
};
