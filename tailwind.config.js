/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        back: "var(--back)",
        fore: "var(--fore)",
        text: "var(--text)",
        mark: "var(--mark)",
      },
    },
  },
  plugins: [],
};
