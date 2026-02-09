import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import forms from "@tailwindcss/forms";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: ['class', "class"],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-mona-sans)',
  				'var(--font-inter)',
  				'system-ui',
  				'sans-serif'
  			],
  			display: [
  				'var(--font-hubot-sans)',
  				'var(--font-mona-sans)',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'var(--font-inter)',
  				'monospace'
  			]
  		},
  		colors: {
  			brand: {
  				violet: '#8B6CFF',
  				aqua: '#00E6B3'
  			},
  			primary: {
  				DEFAULT: 'var(--admin-focus)',
  				foreground: '#ffffff'
  			},
  			secondary: {
  				DEFAULT: 'var(--admin-surface-2)',
  				foreground: 'var(--text)'
  			},
  			bg: 'var(--bg)',
  			'bg-secondary': 'var(--bg-secondary)',
  			surface: 'var(--surface)',
  			soft: 'var(--soft)',
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--text)'
  			},
  			text: 'var(--text)',
  			'text-secondary': 'var(--text-secondary)',
  			subtext: 'var(--subtext)',
  			'text-muted': 'var(--text-muted)',
  			border: 'var(--border)',
  			'border-secondary': 'var(--border-secondary)',
  			ring: 'var(--admin-focus)',
  			accent: {
  				DEFAULT: 'var(--surface)',
  				foreground: 'var(--text)'
  			},
  			'accent-secondary': 'var(--accent-secondary)',
  			'accent-success': 'var(--accent-success)',
  			'accent-warning': 'var(--accent-warning)',
  			'accent-error': 'var(--accent-error)',
  			background: 'var(--bg)',
  			foreground: 'var(--text)',
  			popover: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--text)'
  			},
  			muted: {
  				DEFAULT: 'var(--surface)',
  				foreground: 'var(--subtext)'
  			},
  			destructive: {
  				DEFAULT: 'var(--accent-error)',
  				foreground: '#ffffff'
  			},
  			input: 'var(--border)',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		backgroundColor: {
  			'theme-bg': 'var(--bg)',
  			'theme-surface': 'var(--surface)',
  			'theme-card': 'var(--card)',
  			'theme-muted': 'var(--surface)'
  		},
  		textColor: {
  			'theme-text': 'var(--text)',
  			'theme-secondary': 'var(--text-secondary)',
  			'theme-muted': 'var(--text-muted)',
  			'theme-accent': 'var(--accent)'
  		},
  		borderColor: {
  			'theme-border': 'var(--border)',
  			'theme-border-secondary': 'var(--border-secondary)',
  			DEFAULT: 'color-mix(in oklab, white 12%, transparent)',
  			ring: 'var(--ring)'
  		},
  		boxShadow: {
  			glass: '0 1px 2px rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.25)'
  		},
  		backdropBlur: {
  			xs: '2px'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
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
      tailwindcssAnimate
],
} satisfies Config;
