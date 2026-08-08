import { DEFAULT_TOPIC_SLUG, findArticle } from '@/features/admin-help/content';
import { HelpArticleView } from '@/features/admin-help/components/help-article';
import { HelpTopicsNav } from '@/features/admin-help/components/help-topics-nav';

export const metadata = { title: 'Help Centre — A&A Admin' };

interface PageProps {
  searchParams: Promise<{ topic?: string }>;
}

export default async function AdminHelpPage({ searchParams }: PageProps) {
  const { topic } = await searchParams;
  const activeSlug = topic ?? DEFAULT_TOPIC_SLUG;
  const found = findArticle(activeSlug) ?? findArticle(DEFAULT_TOPIC_SLUG);

  return (
    <div className="admin-page-transition mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-[rgb(var(--foreground))]">Help Centre</h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
          Everything you need to use the admin portal — plus a guided tour to walk you through it.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <HelpTopicsNav activeSlug={found?.article.slug ?? activeSlug} />
        </div>

        <div className="min-w-0 rounded-(--radius) border border-[rgb(var(--border))] bg-[rgb(var(--background))] p-6">
          {found ? <HelpArticleView article={found.article} /> : null}
        </div>
      </div>
    </div>
  );
}
