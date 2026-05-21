/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        display: ["var(--font-display)", "system-ui"],
      },
      colors: {
        orange: {
          50: "#fff7ed",
          100: "#ffedd5",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
        reddit: {
          orange: "#FF4500",
          blue: "#0079D3",
          dark: "#1A1A1B",
          darker: "#0D0D0D",
          surface: "#272729",
          border: "#343536",
          text: "#D7DADC",
          muted: "#818384",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-orange": "pulseOrange 2s infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        pulseOrange: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,69,0,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(255,69,0,0)" },
        },
      },
    },
  },
  plugins: [],
};
