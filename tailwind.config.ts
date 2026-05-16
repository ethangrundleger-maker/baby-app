import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b1020",
        surface: "#121833",
        surface2: "#1a2247",
        ink: "#e8ecff",
        muted: "#8893c4",
        accent: "#7aa2ff",
        sleep: "#8a7bff",
        feed: "#34d399",
        diaper: "#fbbf24",
        outing: "#22d3ee",
        warn: "#f97373",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
