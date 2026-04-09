/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mzansiGreen: '#00FF41', // That classic Matrix/Hacker green
      },
    },
  },
  plugins: [],
}