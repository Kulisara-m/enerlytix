import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./app/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                nunitoSans: ["--font-nunito-sans"],
                gilroy: ["--font-gilroy"],
            },
        },
    },
    plugins: [],
} satisfies Config;