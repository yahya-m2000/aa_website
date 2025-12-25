import type { Metadata } from "next";
import "./globals.css";

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
        url: "https://aatradesolutions.com/og-image.jpg",
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
      className="light"
      style={{ colorScheme: "light" }}
    >
      <body className="antialiased bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
