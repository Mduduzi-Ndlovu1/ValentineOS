import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'reader-cream': '#F8F4E9',
        'reader-beige': '#E8DCCA',
        'reader-brown': '#3C2F2F',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["valentine"],
  },
};

export default config;
