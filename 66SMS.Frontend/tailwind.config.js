/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"Be Vietnam Pro"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        geist:   ['"Geist Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        mono:    ['"DM Mono"',        'ui-monospace',  'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '3xs': ['0.5625rem', { lineHeight: '0.75rem' }],
        '2xs': ['0.625rem',  { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        admin: 'var(--admin-radius, 10px)',
        lg:   'var(--radius)',
        md:   'calc(var(--radius) - 2px)',
        sm:   'calc(var(--radius) - 4px)',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      colors: {
        background:  'rgb(var(--background) / <alpha-value>)',
        foreground:  'rgb(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT:    'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT:    'rgb(var(--popover) / <alpha-value>)',
          foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT:    'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT:    'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT:    'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT:    'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        destructive:  'rgb(var(--destructive) / <alpha-value>)',
        border:       'rgb(var(--border) / <alpha-value>)',
        input:        'rgb(var(--input) / <alpha-value>)',
        ring:         'rgb(var(--ring) / <alpha-value>)',

        'status-pending':     'rgb(var(--status-pending) / <alpha-value>)',
        'status-confirmed':   'rgb(var(--status-confirmed) / <alpha-value>)',
        'status-waiting':     'rgb(var(--status-waiting) / <alpha-value>)',
        'status-in-progress': 'rgb(var(--status-in-progress) / <alpha-value>)',
        'status-completed':   'rgb(var(--status-completed) / <alpha-value>)',
        'status-cancelled':   'rgb(var(--status-cancelled) / <alpha-value>)',

        'lotus-primary':    'var(--lotus-primary)',
        'lotus-secondary':  'var(--lotus-secondary)',
        'lotus-background': 'var(--lotus-background)',
        'lotus-foreground': 'var(--lotus-foreground)',
        'lotus-accent':     'var(--lotus-accent)',
        'lotus-highlight':  'var(--lotus-highlight)',
        'lotus-muted':      'var(--lotus-muted)',
        'lotus-surface':    'var(--lotus-surface)',

        'lotus-rose':       'var(--lotus-rose)',
        'lotus-gold':       'var(--lotus-gold)',
        'lotus-leaf':       'var(--lotus-leaf)',
        'lotus-leaf-light': 'var(--lotus-leaf-light)',
        'lotus-cream':      'var(--lotus-cream)',
        'lotus-deep':       'var(--lotus-deep)',
        'lotus-stone':      'var(--lotus-stone)',
        'lotus-rose-light': 'var(--lotus-rose-light)',
        'lotus-inset':      'var(--lotus-inset)',
        'lotus-error':      'var(--lotus-error)',
        'lotus-vnpay':      'var(--lotus-vnpay)',
        'lotus-vnpay-red':  'var(--lotus-vnpay-red)',
        'lotus-rose-dark':  'var(--lotus-rose-dark)',

        rose: {
          900: 'var(--rose-900)',
          800: 'var(--rose-800)',
          600: 'var(--rose-600)',
          500: 'var(--rose-500)',
          400: 'var(--rose-400)',
          200: 'var(--rose-200)',
          100: 'var(--rose-100)',
          50:  'var(--rose-50)',
        },
        gold: {
          700: 'var(--gold-700)',
          600: 'var(--gold-600)',
          100: 'var(--gold-100)',
        },
        ink: 'var(--ink)',
        warm: {
          600: 'var(--warm-600)',
          400: 'var(--warm-400)',
          300: 'var(--warm-300)',
          100: 'var(--warm-100)',
          50:  'var(--warm-50)',
        },
        page:    'var(--bg-page)',
        surface: 'var(--bg-surface)',
        'card-border': 'var(--border-card)',
        success: {
          DEFAULT: 'var(--success-text)',
          bg:      'var(--success-bg)',
          text:    'var(--success-text)',
        },
        error: {
          DEFAULT: 'var(--error-text)',
          bg:      'var(--error-bg)',
          text:    'var(--error-text)',
        },
        warning: {
          DEFAULT: 'var(--warning-text)',
          bg:      'var(--warning-bg)',
          text:    'var(--warning-text)',
        },
          
        adminGreen: {
          900: 'var(--admin-green-900)',
          800: 'var(--admin-green-800)',
          700: 'var(--admin-green-700)',
          600: 'var(--admin-green-600)',
          500: 'var(--admin-green-500)',
          200: 'var(--admin-green-200)',
          100: 'var(--admin-green-100)',
          50:  'var(--admin-green-50)',
        },
        adminGold: {
          700: 'var(--admin-gold-700)',
          600: 'var(--admin-gold-600)',
          100: 'var(--admin-gold-100)',
        },
        adminInk: 'var(--admin-ink)',
        adminGray: {
          600: 'var(--admin-gray-600)',
          400: 'var(--admin-gray-400)',
          300: 'var(--admin-gray-300)',
          100: 'var(--admin-gray-100)',
          50:  'var(--admin-gray-50)',
        },
        state: {
          success: {
            bg:     'var(--state-success-bg)',
            text:   'var(--state-success-text)',
            border: 'var(--state-success-border)',
            solid:  'var(--state-success-solid)',
          },
          danger: {
            bg:     'var(--state-danger-bg)',
            text:   'var(--state-danger-text)',
            border: 'var(--state-danger-border)',
            solid:  'var(--state-danger-solid)',
          },
          warning: {
            bg:     'var(--state-warning-bg)',
            text:   'var(--state-warning-text)',
            border: 'var(--state-warning-border)',
            solid:  'var(--state-warning-solid)',
          },
          info: {
            bg:     'var(--state-info-bg)',
            text:   'var(--state-info-text)',
            border: 'var(--state-info-border)',
            solid:  'var(--state-info-solid)',
          },
          neutral: {
            bg:     'var(--state-neutral-bg)',
            text:   'var(--state-neutral-text)',
            border: 'var(--state-neutral-border)',
            solid:  'var(--state-neutral-solid)',
          },
        },
      },
      boxShadow: {
        jade:      '0 4px 24px 0 rgba(157, 23, 77, 0.14)',
        'jade-lg': '0 8px 40px 0 rgba(157, 23, 77, 0.16)',
        lotus:     '0 4px 20px 0 rgba(157, 23, 77, 0.14)',
        gold:      '0 4px 20px 0 rgba(184, 134, 11, 0.2)',
        panel:     '0 8px 32px 0 rgba(43, 34, 38, 0.06)',
      },
      keyframes: {
        'slide-in': {
          from: { transform: 'translateY(-16px)', opacity: '0' },
          to:   { transform: 'translateY(0)',     opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.22s ease-out',
        'fade-in':  'fade-in 0.20s ease-out',
        'float':    'float-y 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
