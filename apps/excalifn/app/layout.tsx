import type { Metadata } from "next";
import { Geist_Mono, Instrument_Serif, Outfit, Kalam } from "next/font/google";

import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kalam = Kalam({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-kalam",
});

export const metadata: Metadata = {
  title: "DoodleBoard",
  description: "Collaborative real-time sketchboard by Ajinkya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${instrumentSerif.variable} ${geistMono.variable} ${kalam.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
