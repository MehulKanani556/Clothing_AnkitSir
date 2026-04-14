/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#14372F",
        secondary: "#1D5356",
        gold: "#D4AF37",
        mainBG: "#F8F9FA",
        background: "#FFFFFF",
        border: "#E9ECEF",
        dark: "#1B1B1B",
        mainText: "#343A40",
        lightText: "#ADB5BD",
      },
      screens: {
        xs: "320px",
        sm375: "375px",
        sm: "425px",
        md600: "601px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
        "3xl": "1920px",
        "4xl": "2560px",
      },
      container: {
        center: true, // Center the container by default
        screens: {
          sm: '420px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
          '3xl': '1800px',
        },
      },
    },
  },
  plugins: [],
}