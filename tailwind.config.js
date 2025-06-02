/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'great-vibes': ['"Great Vibes"', 'cursive'],
        'playfair': ['"Playfair Display"', 'serif'],
        'cormorant': ['"Cormorant Garamond"', 'serif'],
      },
      colors: {
        background: '#FAF9F6',
        foreground: '#2F2F2F',
        primary: {
          DEFAULT: '#FADADD',
          foreground: '#2F2F2F',
        },
        secondary: {
          DEFAULT: '#A3B18A',
          foreground: '#2F2F2F',
        },
        accent: {
          DEFAULT: '#E2C290',
          foreground: '#2F2F2F',
        },
        muted: {
          DEFAULT: '#D8A7B1',
          foreground: '#2F2F2F',
        },
      },
    },
  },
  plugins: [],
} 