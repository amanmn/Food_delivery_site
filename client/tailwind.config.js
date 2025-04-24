
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ✅ Scans all JSX/TSX files inside "src"
    "./public/index.html" // ✅ Also include the main HTML file
  ],
  theme: {
    extend: {},

  },
  plugins: [],

  extend: {
    animation: {
      'fade-in': 'fadeIn 0.9s ease-in-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: 0, transform: 'scale(0.95)' },
        '50%': { opacity: 1, transform: 'scale(1)' },
      },
    },
    theme: {
      extend: {
        backdropBlur: {
          xs: '2px',
        }
      }
    }
  }


}




