import { Nunito_Sans, Gilroy } from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
    subsets: ["latin"],
    weight: ["600", "700", "800"],
    variable: "--font-nunito-sans",
});
const gilroy = Gilroy({
    subsets: ["latin"],
    weight: ["500"],
    variable: "--font-gilroy",
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
});
{
    return (
        <html lang="en" className={`${nunitoSans.variable} ${gilroy.variable}`}>
            <body>{children}</body>
        </html>
    );
}