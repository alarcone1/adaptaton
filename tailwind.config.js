/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4B3179', // Morado Profundo (Institucional - Updated)
          light: '#6A4594',
          dark: '#2A1050',
        },
        secondary: {
          DEFAULT: '#42A799', // Turquesa (Calma/Equilibrio)
          light: '#62C7B9',
          dark: '#228779',
        },
        accent: {
          gold: '#EBC04C', // Excelencia/Lujo
          orange: '#E7913B', // Energía
        },
        background: '#F4F4F9',
        surface: '#FFFFFF',
        text: {
          main: '#1E1F3D', // Azul Noche
          secondary: '#64748B'
        }
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
