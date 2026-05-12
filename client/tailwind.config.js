/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pulse-dark': '#06080c',
        'pulse-card': '#0c111a',
        'pulse-teal': '#00f2ff',
        'pulse-blue': '#2d83ec',
        'brand-purple': '#8b5cf6',
        'brand-dark': '#0a0c10',
        'panel-dark': '#11141a',
        'sidebar-dark': '#0d1117',
      },
      backgroundImage: {
        'pulse-gradient': 'linear-gradient(135deg, #00f2ff 0%, #2d83ec 100%)',
      }
    },
  },
  plugins: [],
}
