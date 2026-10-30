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
        ariel: {
          blue: "#0A1A2F",
          gold: "#C9A86A",
          ivory: "#F8F6F2",
          charcoal: "#3A3A3A",
          softGold: "#E8D8B8",
          goldHover: "#b69557",
          darkNavy: "#060f1c",
        },
      },
      fontFamily: {
        heading: ["Montserrat", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        sans: ["Open Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

