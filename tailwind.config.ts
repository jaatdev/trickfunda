import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './styles/**/*.{css}',
  ],
  theme: {
    extend: {
      keyframes: {
        "slideDown": {
          "from": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "to": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "scanline": {
          "0%": { top: "0%", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { top: "100%", opacity: "0" },
        }
      },
      animation: {
        "slide-down": "slideDown 0.2s ease-out",
        "scanline": "scanline 2s linear infinite",
      },
    }
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config