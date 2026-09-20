import Link from "next/link";
import { HelpSearch } from "@/features/admin-help/components/help-search";
import { DEFAULT_TOPIC_SLUG, findArticle } from "@/features/admin-help/content";
import { HelpArticleView } from "@/features/admin-help/components/help-article";
import { HelpTopicsNav } from "@/features/admin-help/components/help-topics-nav";

export const metadata = { title: "Help Centre — A&A Admin" };

interface PageProps {
  searchParams: Promise<{ topic?: string }>;
}

export default async function AdminHelpPage({ searchParams }: PageProps) {
  const { topic } = await searchParams;
  const activeSlug = topic ?? DEFAULT_TOPIC_SLUG;
  const found = findArticle(activeSlug) ?? findArticle(DEFAULT_TOPIC_SLUG);

  return (
    <div className="admin-page-transition mx-auto max-w-[1600px] px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-[rgb(var(--foreground))]">
          Help Centre
        </h1>
      </div>

      <div className="mb-5">
        <Link
          href="/admin/help/tour"
          className="inline-flex min-h-11 items-center rounded-full border border-[rgb(var(--border))] px-5 text-sm font-medium"
        >
          Guided tour
        </Link>
      </div>
      <HelpSearch />
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
