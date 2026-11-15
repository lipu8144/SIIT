/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Brand tokens — DO NOT CHANGE (see README)
        buttons_1: "#eb0249", // primary red-pink (CTAs, badges, highlights)
        buttons_2: "#f18032", // secondary orange (accents, stats)
        twitter: "#1DA1F2", // blue (links, info)
        overlay: "#1c3fdb", // deep blue (hero gradients, admin sidebar)
        body: "#edf4ff", // page background
        text_color2: "#42506a", // body text
        // Extended palette (used in admin/student panels)
        text_color1: "#1b2447", // headings / primary text
        "dark-grey": "#6b7a90", // muted text
        grey: "#e2e8f0", // borders, backgrounds
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        gelasio: ["Gelasio", "Georgia", "serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
