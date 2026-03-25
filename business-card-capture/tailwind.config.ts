import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — modern, clean
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a5b8fc',
          400: '#8093f8',
          500: '#6470f3',
          600: '#4f52e8',
          700: '#4140cc',
          800: '#3636a4',
          900: '#313282',
          950: '#1e1d4c',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8f9fc',
          100: '#f1f3f8',
          200: '#e4e8f2',
          300: '#cdd3e4',
          400: '#9aa3be',
          500: '#6b7491',
          600: '#4e5670',
          700: '#3a4158',
          800: '#282d3f',
          900: '#181c2e',
          950: '#0e1020',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glass': '0 4px 24px -4px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.06)',
        'glow':  '0 0 0 3px rgba(100,112,243,0.25)',
        'card':  '0 1px 3px rgba(0,0,0,0.08), 0 8px 24px -4px rgba(0,0,0,0.08)',
        'float': '0 4px 6px -1px rgba(0,0,0,0.1), 0 20px 40px -8px rgba(0,0,0,0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line':  'scanLine 2s ease-in-out infinite',
        'fade-up':    'fadeUp 0.4s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
      },
      keyframes: {
        scanLine: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%':      { transform: 'translateY(100%)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
