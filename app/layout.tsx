import type { Metadata } from "next";
import { DM_Sans, Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lunar Academy | Moon Base Survival",
  description: "A kid-friendly Moon base survival adventure for ages 7–12.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${nunito.variable} ${fredoka.variable}`}>{children}</body>
    </html>
  );
}
