/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: 'rgb(var(--c-cream-50) / <alpha-value>)',
          100: 'rgb(var(--c-cream-100) / <alpha-value>)',
          200: 'rgb(var(--c-cream-200) / <alpha-value>)',
          300: 'rgb(var(--c-cream-300) / <alpha-value>)',
        },
        sand: {
          100: 'rgb(var(--c-sand-100) / <alpha-value>)',
          200: 'rgb(var(--c-sand-200) / <alpha-value>)',
          300: 'rgb(var(--c-sand-300) / <alpha-value>)',
        },
        taupe: {
          200: 'rgb(var(--c-taupe-200) / <alpha-value>)',
          300: 'rgb(var(--c-taupe-300) / <alpha-value>)',
          400: 'rgb(var(--c-taupe-400) / <alpha-value>)',
          500: 'rgb(var(--c-taupe-500) / <alpha-value>)',
          600: 'rgb(var(--c-taupe-600) / <alpha-value>)',
        },
        espresso: {
          700: 'rgb(var(--c-espresso-700) / <alpha-value>)',
          800: 'rgb(var(--c-espresso-800) / <alpha-value>)',
          900: 'rgb(var(--c-espresso-900) / <alpha-value>)',
        },
        terracotta: {
          300: 'rgb(var(--c-terracotta-300) / <alpha-value>)',
          400: 'rgb(var(--c-terracotta-400) / <alpha-value>)',
          500: 'rgb(var(--c-terracotta-500) / <alpha-value>)',
          600: 'rgb(var(--c-terracotta-600) / <alpha-value>)',
        },
        olive: {
          300: 'rgb(var(--c-olive-300) / <alpha-value>)',
          400: 'rgb(var(--c-olive-400) / <alpha-value>)',
          500: 'rgb(var(--c-olive-500) / <alpha-value>)',
          600: 'rgb(var(--c-olive-600) / <alpha-value>)',
        },
        gold: {
          300: 'rgb(var(--c-gold-300) / <alpha-value>)',
          400: 'rgb(var(--c-gold-400) / <alpha-value>)',
          500: 'rgb(var(--c-gold-500) / <alpha-value>)',
        },
        /* Fixed brand panel — never flips with the theme (sidebar / auth hero). */
        ink: {
          700: '#33414F',
          800: '#27333F',
          900: '#1E2833',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(30, 40, 51, 0.04), 0 8px 24px -12px rgba(30, 40, 51, 0.18)',
        lift: '0 4px 12px rgba(30, 40, 51, 0.06), 0 18px 40px -18px rgba(30, 40, 51, 0.28)',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
