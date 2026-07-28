/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#1B4D3E',
          'green-dark': '#153C30',
          'green-light': '#2A6B57',
          marigold: '#F5A623',
          'marigold-dark': '#E0951A',
          cream: '#FBF7F0',
          sand: '#E8DFD0',
          ink: '#2D2A26',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}