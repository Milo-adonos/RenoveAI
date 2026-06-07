import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F5F0EA",
        foreground: "#1A1A1A",
        accent: "#A0522D",
        "accent-hover": "#8B4513",
        muted: "#8B7D6B",
        card: "#FFFFFF",
        support: "#E8E0D5",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        hero: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "16px",
        lg: "16px",
        xl: "16px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(26, 26, 26, 0.06)",
        soft: "0 2px 12px rgba(26, 26, 26, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
