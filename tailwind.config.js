import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode : 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',

        './resources/js/**/*.jsx',
        './resources/js/**/*.tsx',
        './resources/js/**/*.ts',
    ],

    theme: {
        extend: {
            fontFamily: {

                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },

            colors: {
                primary: {
                    DEFAULT: '#4F46E5',
                    50: '#EEF2FF',
                    100: '#E0E7FF',
                    200: '#C7D2FE',
                    300: '#A5B4FC',
                    400: '#818CF8',
                    500: '#6366F1',
                    600: '#4F46E5',
                    700: '#4338CA',
                    800: '#3730A3',
                    900: '#312E81',
                },
                'background-dark': '#0f172a',
            },

            keyframes: {
                'fade-in-up': {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(10px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            },
            animation: {
                'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
                'fade-in': 'fade-in 0.2s ease-out forwards',
            }
        },
    },

    plugins: [forms],
};
