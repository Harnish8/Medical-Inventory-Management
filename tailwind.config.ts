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
        primary: {
          DEFAULT: "#1E40AF",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#059669",
          foreground: "#ffffff",
        },
        warning: "#D97706",
        critical: "#DC2626",
        success: "#10B981",
        background: "#F3F4F6",
      },
    },
  },
  plugins: [],
};
export default config;
