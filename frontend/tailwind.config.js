/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5', // Indigo 600
        secondary: '#1e1b4b', // Indigo 950
        accent: '#22d3ee', // Cyan 400
        dark: '#0f172a', // Slate 900
        darker: '#020617', // Slate 950
        panel: 'rgba(30, 41, 59, 0.7)', // Slate 800 with 70% opacity for glassmorphism
      },
    },
  },
  plugins: [],
}
