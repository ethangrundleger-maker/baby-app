import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1a1a1f",
          soft: "#2a2a30",
          muted: "#5a5a66",
          subtle: "#8a8a95",
        },
        bg: {
          DEFAULT: "#fafaf7",
          card: "#ffffff",
          alt: "#f3f1ec",
          tint: "#ebe6db",
        },
        brand: {
          50: "#fdf6ef",
          100: "#f9e7d3",
          200: "#f1cca0",
          300: "#e6ac68",
          400: "#d98e3e",
          500: "#c4742a",
          600: "#a45c22",
          700: "#824721",
          800: "#5c321a",
          900: "#3a2012",
        },
        accent: {
          DEFAULT: "#1f3a3d",
          soft: "#2e5559",
        },
        line: {
          DEFAULT: "#e6e1d6",
          strong: "#d4cdbe",
        },
        success: "#16704a",
        warn: "#b8501c",
        danger: "#a8321c",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        "2xl": "28px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,20,30,0.04), 0 8px 24px rgba(20,20,30,0.06)",
        pop: "0 4px 12px rgba(20,20,30,0.08), 0 16px 48px rgba(20,20,30,0.12)",
      },
      maxWidth: {
        prose: "68ch",
        page: "1200px",
        wide: "1400px",
      },
    },
  },
  plugins: [],
};
export default config;
