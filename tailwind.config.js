/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4A2574',
        secondary: '#42A799',
        accent: {
          gold: '#EBC04C',
          orange: '#E7913B',
        },
        background: '#F4F4F9',
        surface: '#FFFFFF',
        text: {
            main: '#1E1F3D',
            secondary: '#64748B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
