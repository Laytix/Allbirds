/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Scan all Liquid files in the theme
    "./**/*.liquid",
    // Scan JS files for dynamic class references
    "./assets/**/*.js",
    // Scan Flowbite node_modules for component classes
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      // Add your brand customizations here
      // colors: {
      //   brand: {
      //     light: '#E0F2FE',
      //     DEFAULT: '#0EA5E9',
      //     dark: '#0369A1',
      //   },
      // },
      // fontFamily: {
      //   sans: ['Inter', 'sans-serif'],
      // },
    },
  },
  plugins: [
    // Flowbite plugin is loaded via @plugin directive in CSS for v4
    // For v3 compatibility, uncomment below:
    // require('flowbite/plugin'),
  ],
};
