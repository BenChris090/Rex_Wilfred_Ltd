module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        gold: '#FFD700',
        'gold-dark': '#B8860B',
        white: '#ffffff',
        bg: '#18130a',
        accent: '#FFD700',
        'accent-dark': '#B8860B',
        card: 'rgba(30, 30, 30, 0.92)',
        text: '#fff8e1',
        gray: {
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        serif: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 8px 32px 0 rgba(0,0,0,0.25)',
        gold: '0 2px 16px #FFD70044',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
      },
      backdropBlur: {
        glass: '8px',
      },
    },
  },
  plugins: [],
}; 