/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        codex: {
          bg: "#0A0A0F",
          surface: "#12121A",
          card: "#1A1A26",
          border: "#2A2A3E",
          gold: "#C9A84C",
          blue: "#4A7FBD",
          text: "#E8E6E0",
          secondary: "#9A9888",
          muted: "#5A5848",
          success: "#4CAF7D",
          locked: "#3A3A4E",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "node-glow": "0 0 12px rgba(201, 168, 76, 0.35)",
        "node-selected": "0 0 0 3px rgba(201, 168, 76, 0.9), 0 0 20px rgba(201, 168, 76, 0.4)",
      },
    },
  },
  plugins: [],
};
