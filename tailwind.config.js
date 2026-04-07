/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{html,js,jsx,ts,tsx,mdx}',
    './components/**/*.{html,js,jsx,ts,tsx,mdx}',
    './utils/**/*.{html,js,jsx,ts,tsx,mdx}',
    './*.{html,js,jsx,ts,tsx,mdx}',
    './src/**/*.{html,js,jsx,ts,tsx,mdx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        menorah: {
          bg: "#0B1F0E",
          primary: "#C6FF00",
          inputBorder: "#CCCCCC4D",
          muted: "#CCCCCC",
          whiteSoft: "#EAEAEA",
          blackSoft: "#00000029"
        }
      }
    },
  },
  plugins: [],
};