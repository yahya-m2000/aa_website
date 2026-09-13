import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Navigation, Footer } from "@/shared/layouts";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SmoothScrollProvider } from "@/core/providers/smooth-scroll-provider";
import { Outfit, DM_Sans } from "next/font/google";
import type { Metadata } from "next";
import "./trade.css";
import "./launch.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-launch-display",
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-launch-body",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === "so"
      ? "A&A Shop — Hadda Ka Iibso"
      : "A&A Shop — Shop it. Make it yours.";
  const description =
    locale === "so"
      ? "App-ka A&A Shop ku baadh alaabooyin Shiinaha laga keeno. Hel dalabyada maanta, dooro alaabtaada oo la xidhiidh kooxda A&A."
      : "Meet the all-new A&A Shop app for Android. Discover products from China, browse today's deals, and find something for your home, your business, or yourself.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "A&A Shop",
      locale: locale === "so" ? "so_SO" : "en_US",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming locale is valid
  if (!routing.locales.some((supported) => supported === locale)) {
    notFound();
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <SmoothScrollProvider>
        <div
          className={`trade-site app-launch ${outfit.variable} ${dmSans.variable}`}
          lang={locale}
        >
          <a className="trade-skip" href="#main-content">
            {locale === "so" ? "U gudub nuxurka" : "Skip to content"}
          </a>
          <Navigation locale={locale} />
          <main id="main-content" className="min-h-screen" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </div>
      </SmoothScrollProvider>
    </NextIntlClientProvider>
  );
}
