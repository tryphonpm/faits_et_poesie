import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/app.vue',
    './app/error.vue',
    './content/**/*.md'
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#fcfbf7',
          border: '#d6cfc0'
        },
        ink: {
          DEFAULT: '#111111',
          body: '#44403c',
          muted: '#57534e',
          faint: '#78716c'
        },
        accent: {
          DEFAULT: '#059669',
          hover: '#047857',
          soft: '#ecfdf5'
        },
        rubrique: {
          DEFAULT: '#b45309',
          soft: '#fffbeb'
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'Times New Roman', 'serif'],
        body: ['Georgia', 'Times New Roman', 'serif'],
        ornamenta: ['"Ornamenta Monumenta"', 'serif']
      },
      maxWidth: {
        newspaper: '75rem'
      },
      boxShadow: {
        newspaper: '0 0 10px rgba(0, 0, 0, 0.05)'
      },
      letterSpacing: {
        masthead: '-0.025em',
        label: '0.2em'
      }
    }
  },
  plugins: [typography]
}
