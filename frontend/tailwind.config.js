/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        helix: {
          bg: "#030712",
          surface: "#0b132b",
          card: "rgba(15, 23, 42, 0.7)",
          border: "rgba(56, 189, 248, 0.15)",
          borderHover: "rgba(168, 85, 247, 0.4)",
          cyan: "#38bdf8",
          purple: "#a855f7",
          blue: "#3b82f6",
          darkBlue: "#1e1b4b",
          emerald: "#10b981",
          gold: "#f59e0b",
          rose: "#f43f5e"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)' },
        }
      },
      backgroundImage: {
        'quantum-gradient': 'linear-gradient(135deg, #030712 0%, #0f172a 50%, #1e1b4b 100%)',
        'cyan-purple-gradient': 'linear-gradient(135deg, #38bdf8 0%, #a855f7 100%)',
        'glass-card': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      }
    },
  },
  plugins: [],
}
