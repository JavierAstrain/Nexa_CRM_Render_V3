import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        nexa: {
          50: '#e6f6ff',
          100:'#cceeff',
          200:'#99ddff',
          300:'#66ccff',
          400:'#33bbff',
          500:'#00aaff',
          600:'#0088cc',
          700:'#006699',
          800:'#004466',
          900:'#002233'
        },
        graybg: '#f5f7fb'
      },
      backgroundImage: {
        'nexa-gradient': 'linear-gradient(90deg, #002a5c 0%, #00bcd4 100%)'
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0,0,0,0.08)'
      }
    }
  },
  plugins: []
} satisfies Config
