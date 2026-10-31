import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ArielMC | The Master Export Compendium — B2B Sourcing & Digital Line Sheet Engine',
  description:
    'Ariel Marketing & Communications Limited — Crafted in Bangladesh. Curated by ArielMC. Delivered Worldwide. Official digital line sheet compilation engine for Leather, Jute, Ceramics, Textiles, and Pottery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Open+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#F8F6F2] text-[#3A3A3A] antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
