/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./public/**/*.svg"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        back: "var(--back)",
        fore: "var(--fore)",
        text: "var(--text)",
        mark: "var(--mark)",
      },
      screens: {
        "3xl": "1920px",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};
