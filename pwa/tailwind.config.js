/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Gujarat Government Design System Colors
      colors: {
        // Primary Gujarat Blue
        gujarat: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Primary Gujarat Blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },
        // Secondary Saffron Orange
        saffron: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Saffron Orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407'
        },
        // Success Green (for completed transfers)
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16'
        },
        // Warning Yellow (for pending actions)
        warning: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006'
        },
        // Error Red (for disputes/issues)
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a'
        }
      },
      // Custom fonts for government branding
      fontFamily: {
        'gujarati': ['Noto Sans Gujarati', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif']
      },
      // Mobile-first spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      // Touch-friendly sizing
      height: {
        'touch': '44px', // Minimum touch target
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
      },
      width: {
        'touch': '44px'
      },
      // Animation for smooth interactions
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      // Shadow variations for depth
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.1)',
        'card': '0 4px 12px -2px rgba(0, 0, 0, 0.1)',
        'floating': '0 8px 24px -4px rgba(0, 0, 0, 0.15)'
      },
      // Border radius for consistency
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      }
    },
    // Mobile-first breakpoints
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      // Custom breakpoints for specific use cases
      'mobile': {'max': '767px'},
      'tablet': {'min': '768px', 'max': '1023px'},
      'desktop': {'min': '1024px'}
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
    // Custom plugin for safe area handling
    function({ addUtilities }) {
      const safeAreaUtilities = {
        '.pt-safe': {
          paddingTop: 'env(safe-area-inset-top)'
        },
        '.pb-safe': {
          paddingBottom: 'env(safe-area-inset-bottom)'
        },
        '.pl-safe': {
          paddingLeft: 'env(safe-area-inset-left)'
        },
        '.pr-safe': {
          paddingRight: 'env(safe-area-inset-right)'
        },
        '.p-safe': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }
      }
      addUtilities(safeAreaUtilities)
    },
    // Custom plugin for touch targets
    function({ addUtilities }) {
      const touchUtilities = {
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
        '.touch-area': {
          padding: '12px',
          margin: '-12px',
          borderRadius: '12px'
        }
      }
      addUtilities(touchUtilities)
    }
  ],
  // Dark mode support for accessibility
  darkMode: 'media'
}
