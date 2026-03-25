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
        // T-Mobile brand palette — Magenta #E20074
        brand: {
          50:  '#fff0f6',
          100: '#ffe0ee',
          200: '#ffc1de',
          300: '#ff8dbf',
          400: '#f0439b',
          500: '#e20074', // T-Mobile Magenta
          600: '#c80068',
          700: '#a3005a',
          800: '#7a0043',
          900: '#50002d',
          950: '#1e0010',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f7f7f7',
          100: '#ebebeb',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#3d3d3d',
          700: '#2d2d2d',
          800: '#1c1c1c',
          900: '#0f0f0f',
          950: '#000000', // Pure black — T-Mobile background
        },
      },
      fontFamily: {
        // Barlow approximates T-Mobile Sans — bold, condensed-friendly
        sans: ['Barlow', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glass': '0 4px 24px -4px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
        'glow':  '0 0 0 3px rgba(226,0,116,0.35)', // T-Mobile Magenta glow
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
