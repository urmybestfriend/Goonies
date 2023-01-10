/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        checker: "url('/banner/checkered.png')",
        mintchecker: "url('/mintcheckered.png')",
        retrogradient:
          "linear-gradient(90deg, rgb(179, 72, 68) 10%, rgb(196, 96, 67) 10%, rgb(196, 96, 67) 20%, rgb(211, 161, 82) 20%, rgb(211, 161, 82) 30%, rgb(227, 199, 116) 30%, rgb(227, 199, 116) 40%, rgb(236, 217, 148) 40%, rgb(236, 217, 148) 50%, rgb(179, 72, 68) 50%, rgb(179, 72, 68) 60%, rgb(196, 96, 67) 60%, rgb(196, 96, 67) 70%, rgb(211, 161, 82) 70%, rgb(211, 161, 82) 80%, rgb(227, 199, 116) 80%, rgb(227, 199, 116) 90%, rgb(236, 217, 148) 90%, rgb(236, 217, 148) 100%)",
        mintBtnNormal: "url('/button/base.png/')",
        mintBtnHover: "url('/button/hover.png/')",
      },
      dropShadow: {
        mintBtn: '#fff 4px 4px 0 0, #000 4px 4px 0 1px;'
      },
      colors: {
        primary: "#3f0102",
        secondary: "#871313",
        tertiary: "#1c1c1c",
      },
    },
  },
  plugins: [],
};
