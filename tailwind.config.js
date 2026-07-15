module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#FDF2F5",
          100: "#FCE7EE",
          200: "#F8D0DD",
          300: "#F2A8C0",
          400: "#E8759B",
          500: "#A83D5C",
          600: "#9A2B4D",
          700: "#7B1B38",
          800: "#5C142A",
          900: "#4A0F22",
          950: "#2D0914",
        },
        champagne: {
          50:  "#FDF8F0",
          100: "#F7E6CA",
          200: "#EDD5A8",
        },
        cream: {
          50:  "#FDFBD4",
          100: "#FAF5B8",
        },
        warm: {
          50:  "#F9F6F3",
          100: "#F2EDE8",
          200: "#E8E0D8",
          300: "#D4C9BE",
          400: "#B5A89C",
          500: "#9A8E82",
          600: "#7D7268",
          700: "#5E554E",
          800: "#3F3935",
          900: "#201D1B",
        },
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(74, 15, 34, 0.04), 0 4px 12px rgba(74, 15, 34, 0.03)",
        "card-hover": "0 4px 8px rgba(74, 15, 34, 0.06), 0 12px 24px rgba(74, 15, 34, 0.04)",
        bordeaux: "0 4px 16px rgba(74, 15, 34, 0.2), 0 12px 40px rgba(74, 15, 34, 0.15)",
        "bordeaux-sm": "0 2px 8px rgba(123, 27, 56, 0.15)",
      },
    },
  },
  plugins: [],
};