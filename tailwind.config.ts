import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Map CSS variables to Tailwind tokens
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

        // Semantic tokens
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        input: "var(--input)",
        "card-bg": "var(--card-bg)",
        "card-foreground": "var(--card-foreground)",
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
    },
  },
  plugins: [forms],
} satisfies Config;
