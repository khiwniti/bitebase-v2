import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
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
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // BiteBase brand colors
        bitebase: {
          primary: "var(--bitebase-primary)",
          secondary: "var(--bitebase-secondary)",
          accent: "var(--bitebase-accent)",
          background: "var(--bitebase-background)",
          text: "var(--bitebase-text)",
          "text-secondary": "var(--bitebase-text-secondary)",
          "light-gray": "var(--bitebase-light-gray)",
          "medium-gray": "var(--bitebase-medium-gray)",
          "dark-gray": "var(--bitebase-dark-gray)",
        },
      },
      fontFamily: {
        sans: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        bitebase: ["JetBrains Mono", "monospace"],
      },
      spacing: {
        "bitebase-xs": "var(--bitebase-spacing-xs)",
        "bitebase-sm": "var(--bitebase-spacing-sm)",
        "bitebase-md": "var(--bitebase-spacing-md)",
        "bitebase-lg": "var(--bitebase-spacing-lg)",
        "bitebase-xl": "var(--bitebase-spacing-xl)",
      },
      boxShadow: {
        "bitebase-sm": "var(--bitebase-shadow-sm)",
        "bitebase-md": "var(--bitebase-shadow-md)",
        "bitebase-lg": "var(--bitebase-shadow-lg)",
        "bitebase-xl": "var(--bitebase-shadow-xl)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "bitebase-spinner": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "bitebase-spinner": "bitebase-spinner 1s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
