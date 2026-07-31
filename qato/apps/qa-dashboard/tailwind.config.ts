import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0F1420",
        surface: "#171D2B",
        border: "#2A3244",
        foreground: "#E8EAED",
        muted: "#8B93A7",
        pass: "#3FB68B",
        fail: "#E5484D",
        skip: "#F2B84B",
        accent: "#4FD1C5",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
