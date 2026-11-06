/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta "Elegante y sofisticado": azul noche · marfil · terracota · dorado suave
        brand: {
          DEFAULT: '#18283f', // azul noche
          dark: '#101a29', // azul noche profundo (footer, barra superior)
          soft: '#38465a', // azul noche aclarado (degradados)
          light: '#f1e6d8', // marfil cálido más marcado (fondos de chips y avisos)
        },
        ivory: '#f9f0e7', // marfil (fondo de la página)
        accent: {
          DEFAULT: '#a6644b', // terracota (versión con contraste AA para botones y textos)
          dark: '#8f5640', // hover
          soft: '#c8795a', // terracota original, para detalles y degradados
        },
        gold: '#d7b77a', // dorado suave
      },
      fontFamily: { sans: ['Poppins', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
