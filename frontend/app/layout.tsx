import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { GlassCard, StyledContainer } from "./donate/page";
import GallerySection from "@/components/GallerySection";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Project REACH",
  icons: {
    icon: '/reachlogo.png' 
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${openSans.variable} antialiased`}
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        <Navbar />
        <main>{children}</main>
        <GallerySection />
      </body>
    </html>
  );
}
