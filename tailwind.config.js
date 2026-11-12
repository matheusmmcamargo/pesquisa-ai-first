/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta AC Executive Black Edition Oficial
        ac: {
          carbon: "#0B0C0D",      // Preto carbono de fundo primário
          graphite: "#141516",    // Grafite para containers secundários
          surface: "#1B1C1E",     // Superfície elevada para cards e modais
          surfaceHover: "#232427",// Hover sutil sobre superfície
          border: "#292A2E",      // Borda executiva fina
          borderSubtle: "#202124",// Borda discreta
          champagne: "#B38D64",   // Champagne metálico refinado
          champagneHover: "#C69F76",
          gold: "#D7B779",        // Dourado suave para ênfases nobres
          editorial: "#F5F3EF",   // Branco editorial para tipografia primária
          secondary: "#A8A9AC",   // Cinza secundário para apoios
          muted: "#6E7075",       // Cinza atenuado para notas de rodapé
          emerald: "#2FB37E",     // Verde calibrado para indicadores positivos
          rose: "#E05252",        // Vermelho sóbrio para alertas de gargalo
          amber: "#D99B38",       // Âmbar para pendências a validar
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        editorial: ["Georgia", "serif"],
      },
      boxShadow: {
        "ac-card": "0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(179, 141, 100, 0.14)",
        "ac-glow": "0 0 35px rgba(179, 141, 100, 0.12)",
        "ac-hover": "0 12px 30px -10px rgba(179, 141, 100, 0.22)",
      },
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
      },
    },
  },
  plugins: [],
}
