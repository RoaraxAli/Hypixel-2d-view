/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#090c10',
          secondary: '#0d1117',
          card: '#161b22',
          border: '#30363d',
          gold: '#ffaa00',
          emerald: '#00aa00',
          cyan: '#55ffff',
          purple: '#aa00aa',
          blue: '#5555ff'
        }
      }
    },
  },
  plugins: [],
}
