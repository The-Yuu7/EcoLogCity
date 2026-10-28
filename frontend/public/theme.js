// ==============================================================================
// EcoLogCity - Sistema de diseño (compartido por login.html e index.html)
// Paleta: Navy #242E42 · Naranja #DF4927 · Celeste #78A6D2 · Gris #F0F2F5
// Tipografía: Helvetica Neue
//
// Las paletas de Tailwind que ya usa la interfaz se redefinen sobre la marca:
// emerald/teal = naranja (acción principal), slate = neutros navy,
// indigo = navy, sky/blue = celeste. Así todo el HTML hereda el estilo.
// ==============================================================================

const NARANJA = {
  50: '#FDF1EE', 100: '#FADCD4', 200: '#F5B9A9', 300: '#EE927B', 400: '#E66C51',
  500: '#DF4927', 600: '#C93D1E', 700: '#A63219', 800: '#842915', 900: '#5E1E10', 950: '#3D130A',
};
const NEUTRO = {
  50: '#F7F8FA', 100: '#F0F2F5', 200: '#E4E7EC', 300: '#CED3DB', 400: '#9AA2B1',
  500: '#6B7485', 600: '#4E5768', 700: '#3A4355', 800: '#2D3648', 900: '#242E42', 950: '#1A2232',
};
const NAVY = {
  50: '#EEF0F4', 100: '#D9DDE6', 200: '#B3BBCC', 300: '#8893AB', 400: '#5E6B86',
  500: '#3E4A63', 600: '#2F3A51', 700: '#242E42', 800: '#1C2434', 900: '#141A26', 950: '#0D111A',
};
const CELESTE = {
  50: '#F1F6FB', 100: '#E1ECF6', 200: '#C4D9ED', 300: '#A3C3E3', 400: '#8DB4DB',
  500: '#78A6D2', 600: '#5E8DBC', 700: '#4A729A', 800: '#3A5A79', 900: '#2B4259', 950: '#1D2D3D',
};

const FUENTE = ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'];

tailwind.config = {
  theme: {
    extend: {
      fontFamily: { sans: FUENTE, mono: FUENTE },
      colors: {
        marca: { navy: '#242E42', naranja: '#DF4927', celeste: '#78A6D2', gris: '#F0F2F5' },
        emerald: NARANJA,
        teal: NARANJA,
        slate: NEUTRO,
        gray: NEUTRO,
        indigo: NAVY,
        sky: CELESTE,
        blue: CELESTE,
      },
      borderRadius: { xl: '14px', '2xl': '20px' },
      boxShadow: {
        sm: '0 1px 2px rgba(36, 46, 66, 0.04)',
        DEFAULT: '0 2px 8px rgba(36, 46, 66, 0.06)',
        lg: '0 8px 24px rgba(36, 46, 66, 0.10)',
        '2xl': '0 16px 40px rgba(36, 46, 66, 0.16)',
      },
    },
  },
};

// Colores para código JS (marcadores, rutas y popups del mapa)
window.MARCA = {
  navy: '#242E42',
  naranja: '#DF4927',
  celeste: '#78A6D2',
  gris: '#F0F2F5',
  texto: '#242E42',
  textoSuave: '#6B7485',
  peligro: '#B42318',
  // Una ruta por vehículo, distinguibles entre sí y dentro de la paleta
  rutas: ['#DF4927', '#242E42', '#78A6D2', '#E8A33D', '#5E8DBC'],
};
