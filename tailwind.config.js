/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Memento-mori base: deep ink, warm bone, one living accent (brand purple).
        ink: {
          DEFAULT: "#0c0b10",
          soft: "#15131c",
          card: "#1c1a26",
        },
        bone: {
          DEFAULT: "#f5f2ec",
          soft: "#e8e4d9",
          muted: "#9b9788",
        },
        accent: {
          DEFAULT: "#854dff", // the project's original soft-purple, kept alive
          soft: "#a987ff",
          dim: "#3a2d63",
        },
        "light-red": "#ff5757",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Fluid display sizes for the big "wrapped" figures.
        mega: ["clamp(4rem, 18vw, 11rem)", { lineHeight: "0.9" }],
        huge: ["clamp(3rem, 12vw, 7rem)", { lineHeight: "0.95" }],
        big: ["clamp(2rem, 7vw, 4rem)", { lineHeight: "1" }],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
}
