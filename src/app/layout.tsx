import type { Metadata } from "next";
import { Playfair_Display, Great_Vibes, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: '--font-great-vibes',
});

const cormorant = Cormorant_Garamond({
  weight: "400",
  subsets: ["latin"],
  variable: '--font-cormorant',
});

export const metadata: Metadata = {
  title: "SnapTheKnot - Wedding Photo Sharing",
  description: "Share and view photos from Esther & Edward's wedding celebration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${greatVibes.variable} ${cormorant.variable}`}>
      <body className={`${cormorant.className} bg-background text-foreground antialiased min-h-screen`}>
        <main className="relative">
          {children}
        </main>
      </body>
    </html>
  );
}
