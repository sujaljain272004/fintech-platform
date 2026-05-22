/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        fintech: "0 20px 40px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        "mesh-light":
          "radial-gradient(circle at top left, rgba(20,184,166,0.15), transparent 32%), radial-gradient(circle at top right, rgba(14,165,233,0.1), transparent 30%), linear-gradient(180deg, #f4fbfb 0%, #f8fafc 100%)",
        "mesh-dark":
          "radial-gradient(circle at top left, rgba(20,184,166,0.22), transparent 30%), radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 25%), linear-gradient(180deg, #07111f 0%, #0f172a 100%)",
      },
    },
  },
  plugins: [],
};
