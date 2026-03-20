import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MatrixRain } from "@/components/effects/matrix-rain";
import { FallingSymbols } from "@/components/effects/falling-symbols";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marketing Detox - Historias de la Mente",
  description: "Hub centralizado de agentes de contenido psicológico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MatrixRain />
        <FallingSymbols />
        <Sidebar />
        <main className="ml-64 min-h-screen p-8 relative" style={{ zIndex: 2 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
