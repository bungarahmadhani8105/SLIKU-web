import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SLIKU - Aplikasi Simulasi Tabungan & Perencanaan Finansial",
  description: "Simulasikan target tabungan impian, bunga majemuk, dan estimasi waktu pencapaian finansial Anda secara cerdas, akurat, dan mudah bersama SLIKU.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-yellow-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
