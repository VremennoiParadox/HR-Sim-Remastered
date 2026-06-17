/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060D18',
          900: '#0B1220',
          800: '#111B2E',
          700: '#16233B',
          600: '#1A2942',
          500: '#243352',
        },
        cyan: {
          400: '#38BDF8',
          500: '#22D3EE',
        },
        gold: {
          400: '#FCD34D',
          500: '#FBBF24',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float-up': 'floatUp 1.2s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-60px) scale(1.2)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(56, 189, 248, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(56, 189, 248, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
