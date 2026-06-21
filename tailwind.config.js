/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        slate: {
          50: '#FFFFFF', // White
          100: '#F8F8F8',
          200: '#E5E5E5', // Light Gray
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#14213D', // Navy
          800: '#14213D', // Navy
          900: '#000000', // Black
        },
        indigo: {
          50: '#E5E5E5', // Light Gray
          100: '#D1D5DB',
          200: '#9CA3AF',
          300: '#6B7280',
          400: '#4B5563',
          500: '#14213D', // Navy Blue
          600: '#14213D', // Navy Blue
          700: '#000000', // Black
          800: '#000000', // Black
          900: '#000000', // Black
        },
        rose: {
          50: '#FFF8F0',
          100: '#FEF0DF',
          200: '#FDE1BF',
          300: '#FCD29E',
          400: '#FCA311', // Vibrant Orange
          500: '#FCA311', // Vibrant Orange
          600: '#E69002',
          700: '#CC8002',
          800: '#14213D', // Navy
          900: '#000000', // Black
        },
        amber: {
          50: '#FFF8F0',
          100: '#FEF0DF',
          200: '#FDE1BF',
          300: '#FCD29E',
          400: '#FCA311', // Vibrant Orange
          500: '#FCA311', // Vibrant Orange
          600: '#E69002',
          700: '#CC8002',
          800: '#14213D', // Navy
          900: '#000000', // Black
        },
        sky: {
          50: '#E5E5E5', // Light Gray
          100: '#E5E5E5',
          200: '#D1D5DB',
          300: '#9CA3AF',
          400: '#6B7280',
          500: '#14213D', // Navy
          600: '#14213D', // Navy
          700: '#000000', // Black
          800: '#000000', // Black
          900: '#000000', // Black
        }
      }
    },
  },
  plugins: [],
}

