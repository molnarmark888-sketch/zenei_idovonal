/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./app.js", "./style.css"],
  theme: {
    extend: {
      colors: {
        primary: "#050816",
        secondary: "#aaa6c3",
        tertiary: "#151030",
        neon: "#00ffff",
      },
    },
  },
  plugins: [],
}