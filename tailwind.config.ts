import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#b91c1c",
          gold: "#d4af37",
          dark: "#0a0a0a",
          charcoal: "#171717",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        display: ["var(--font-bebas)"], // New Display Font
      },
    },
  },
  plugins: [],
};
export default config;