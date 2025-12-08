/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "harc-orange": "#FF7D29",
        "harc-green-dark": "#1E5631",
        "harc-green-light": "#A3E4A2",
        "harc-cream": "#FFF9E8",
        "harc-dark": "#132016",
        "harc-muted": "#4B5563",
        "harc-border": "#D1D5DB",
      },
    },
  },
  plugins: [],
};
