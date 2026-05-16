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
        // Our custom Pay4Pawa branding
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e', // Success Green
          600: '#16a34a', // Primary Green
          700: '#15803d', // Darker Green
          900: '#14532d', // Deep Forest (Nigerian Flag style)
        },
      },
    },
  },
  plugins: [],
};
export default config;