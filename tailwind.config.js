/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'status-complete': '#22c55e',
        'status-in-progress': '#3b82f6',
        'status-blocked': '#ef4444',
        'status-not-started': '#9ca3af',
        'today-marker': '#f97316',
        'dependency-arrow': '#6b7280',
      },
    },
  },
  plugins: [],
}
