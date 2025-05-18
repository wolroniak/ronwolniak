/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // or 'media' or 'selector'
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue", // If you have an app.vue file
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
