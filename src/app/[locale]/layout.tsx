import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Navigation, Footer } from '@/shared/layouts';
import { AnimatedDotGrid } from '@/shared/components/ui';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SmoothScrollProvider } from '@/core/providers/smooth-scroll-provider';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming locale is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <SmoothScrollProvider>
        <AnimatedDotGrid />
        <Navigation locale={locale} />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </SmoothScrollProvider>
    </NextIntlClientProvider>
  );
}
