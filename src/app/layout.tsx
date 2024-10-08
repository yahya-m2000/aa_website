import type { Metadata } from "next";
import { assistant, inriaSerif } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aatradesolutions.com/"),
  title: "A&A",
  description: "...",
  openGraph: {
    title: "A&A Trade Solutions",
    description: "...",
    url: "www.aatradesolutions.com/",
    type: "website",
    images: [
      {
        url: "./assets/images/thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "A&A Trade Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "A&A Trade Solutions",
    description: "...",
    images: ["./assets/images/thumbnail.jpg"],
  },
  icons: {
    icon: "./assets/images/thumbnail.jpg",
    shortcut: "./assets/images/thumbnail.jpg",
    apple: "./assets/images/thumbnail.jpg",
  },
  authors: [{ name: "Yahya Gadiid", url: "jadiid.co.uk" }],
  keywords: ["innovation", "trade", "technology", "business"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${assistant.variable} ${inriaSerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
