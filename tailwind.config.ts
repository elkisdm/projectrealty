import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import forms from "@tailwindcss/forms";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-mona-sans)", "var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-hubot-sans)", "var(--font-mona-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-inter)", "monospace"],
      },
      colors: {
        // Brand accents for gradients and CTAs
        brand: {
          violet: "#8B6CFF",
          aqua: "#00E6B3",
        },
        primary: {
          DEFAULT: "#8B6CFF",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#00E6B3",
          foreground: "#000000",
        },
        // Map CSS variables to Tailwind tokens for consistency in class usage
        bg: "var(--bg)",
        "bg-secondary": "var(--bg-secondary)",
        surface: "var(--surface)",
        soft: "var(--soft)",
        card: "var(--card)",
        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",
        subtext: "var(--subtext)",
        "text-muted": "var(--text-muted)",
        border: "var(--border)",
        "border-secondary": "var(--border-secondary)",
        ring: "var(--ring)",
        accent: "var(--accent)",
        "accent-secondary": "var(--accent-secondary)",
        "accent-success": "var(--accent-success)",
        "accent-warning": "var(--accent-warning)",
        "accent-error": "var(--accent-error)",
      },
      // Utilidades de tema unificadas
      backgroundColor: {
        "theme-bg": "var(--bg)",
        "theme-surface": "var(--surface)",
        "theme-card": "var(--card)",
        "theme-muted": "var(--surface)",
      },
      textColor: {
        "theme-text": "var(--text)",
        "theme-secondary": "var(--text-secondary)",
        "theme-muted": "var(--text-muted)",
        "theme-accent": "var(--accent)",
      },
      borderColor: {
        "theme-border": "var(--border)",
        "theme-border-secondary": "var(--border-secondary)",
        DEFAULT: "color-mix(in oklab, white 12%, transparent)",
        ring: "var(--ring)",
      },
      boxShadow: {
        glass: "0 1px 2px rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    forms,
    plugin(function ({ addUtilities, theme }) {
      addUtilities({
        ".glass": {
          backgroundColor: "color-mix(in oklab, white 6%, transparent)",
          border: "1px solid color-mix(in oklab, white 10%, transparent)",
          backdropFilter: "blur(8px)",
          boxShadow: theme("boxShadow.glass") as string,
        },
        ".glass-strong": {
          backgroundColor: "color-mix(in oklab, white 8%, transparent)",
          border: "1px solid color-mix(in oklab, white 14%, transparent)",
          backdropFilter: "blur(12px)",
          boxShadow: theme("boxShadow.glass") as string,
        },
      });
    }),
  ],
} satisfies Config;
