import type { Metadata } from "next";
import { Inter_Tight, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "A&A - China-Africa Trade Solutions",
  description:
    "Your trusted partner in procurement, logistics, and supply chain solutions. We source quality products from China and deliver them seamlessly across African markets.",
  openGraph: {
    title: "A&A - China-Africa Trade Solutions",
    description:
      "Your trusted partner in procurement, logistics, and supply chain solutions. We source quality products from China and deliver them seamlessly across African markets.",
    url: "https://aatradesolutions.com",
    siteName: "A&A Trade Solutions",
    locale: "en_US",
    type: "website",
    images: [
      {
        // TODO: replace with a proper 1200x630 branded OG image once real photography is available.
        url: "https://aatradesolutions.com/logo.png",
        width: 1200,
        height: 630,
        alt: "A&A Trade Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "A&A - China-Africa Trade Solutions",
    description:
      "Your trusted partner in procurement, logistics, and supply chain solutions.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`light ${interTight.variable} ${inter.variable}`}
      style={{ colorScheme: "light" }}
    >
      <body className="antialiased bg-white text-[rgb(var(--foreground))] font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
