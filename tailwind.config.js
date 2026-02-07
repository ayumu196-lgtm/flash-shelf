/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'piyo-pink': '#FF7C90',
                'piyo-pinkLight': '#FFF0F3',
                'piyo-cream': '#FFFCF9',
                'piyo-text': '#4A4A4A',
                'piyo-gray': '#A0A0A0',
                'piyo-border': '#FFD1D9',
            },
            fontFamily: {
                sans: [
                    '"M PLUS Rounded 1c"',
                    '"Hiragino Maru Gothic ProN"',
                    '"Quicksand"',
                    'sans-serif'
                ],
            },
            borderRadius: {
                'pill': '9999px',
            },
            boxShadow: {
                'cute': '0 4px 14px rgba(255, 124, 144, 0.4)',
            }
        },
    },
    plugins: [],
}
