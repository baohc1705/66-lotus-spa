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
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        mono:    ['"DM Mono"',        'ui-monospace',  'SFMono-Regular', 'monospace'],
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

        /* ── Status Tokens ── */
        'status-pending':     'rgb(var(--status-pending) / <alpha-value>)',
        'status-confirmed':   'rgb(var(--status-confirmed) / <alpha-value>)',
        'status-waiting':     'rgb(var(--status-waiting) / <alpha-value>)',
        'status-in-progress': 'rgb(var(--status-in-progress) / <alpha-value>)',
        'status-completed':   'rgb(var(--status-completed) / <alpha-value>)',
        'status-cancelled':   'rgb(var(--status-cancelled) / <alpha-value>)',

        /* ── Hoa Sen Spa Brand Tokens ── */
        'lotus-primary':    'var(--lotus-primary)',
        'lotus-secondary':  'var(--lotus-secondary)',
        'lotus-background': 'var(--lotus-background)',
        'lotus-foreground': 'var(--lotus-foreground)',
        'lotus-accent':     'var(--lotus-accent)',
        'lotus-highlight':  'var(--lotus-highlight)',
        'lotus-muted':      'var(--lotus-muted)',
        'lotus-surface':    'var(--lotus-surface)',

        /* ── Brand Identity Tokens (landing page) ── */
        'lotus-rose':       'var(--lotus-rose)',
        'lotus-gold':       'var(--lotus-gold)',
        'lotus-leaf':       'var(--lotus-leaf)',
        'lotus-leaf-light': 'var(--lotus-leaf-light)',
        'lotus-cream':      'var(--lotus-cream)',
        'lotus-deep':       'var(--lotus-deep)',
        'lotus-stone':      'var(--lotus-stone)',
        'lotus-rose-light': 'var(--lotus-rose-light)',
        'lotus-error':      'var(--lotus-error)',
      },
      boxShadow: {
        jade:      '0 4px 24px 0 rgba(210, 91, 124, 0.12)', /* shadow hồng sen nhạt */
        'jade-lg': '0 8px 40px 0 rgba(210, 91, 124, 0.16)', /* shadow hồng sen đậm */
        lotus:     '0 4px 20px 0 rgba(210, 91, 124, 0.15)',
        gold:      '0 4px 20px 0 rgba(176, 141, 87, 0.20)',
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
