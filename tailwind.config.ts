import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cinza-escuro — fundo em camadas
        base: {
          950: "#111312",
          900: "#151817",
          850: "#1a1d1b",
          800: "#1f2321",
          700: "#272b28",
          600: "#343a36",
          500: "#454c47",
        },
        // Verde-musgo — cor de destaque
        moss: {
          50: "#f1f4ef",
          100: "#dde4d9",
          200: "#bcc9b4",
          300: "#9aae8f",
          400: "#7d9471",
          500: "#657c59",
          600: "#506347",
          700: "#3e4d37",
          800: "#2d3828",
          900: "#1f271c",
        },
        ink: {
          DEFAULT: "#e9ebe8",
          muted: "#9ba29b",
          faint: "#6c736d",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.18s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
