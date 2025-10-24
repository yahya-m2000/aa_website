import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A&A - China-Africa Trade Solutions",
  description:
    "Your trusted partner in procurement, logistics, and supply chain solutions. We source quality products from China and deliver them seamlessly across African markets.",
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
      <body className="antialiased bg-white text-slate-900">{children}</body>
    </html>
  );
}
