'use client';

import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/core/utils';
import { HELP_CATEGORIES } from '../content';

export function HelpTopicsNav({ activeSlug }: { activeSlug: string }) {
  return (
    <nav className="space-y-6">
      <div>
        <Link
          href="/admin/help/tour"
          className="flex items-center gap-2 rounded-(--radius) px-2 py-1.5 text-sm font-medium text-[rgb(var(--accent))] transition-colors hover:bg-[rgb(var(--accent))]/10"
        >
          <GraduationCap className="h-4 w-4 shrink-0" />
          Start the guided tour
        </Link>
      </div>

      {HELP_CATEGORIES.map((category) => (
        <div key={category.slug}>
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted-foreground))]">
            {category.label}
          </p>
          <ul className="space-y-0.5">
            {category.articles.map((article) => {
              const isActive = article.slug === activeSlug;
              return (
                <li key={article.slug}>
                  <Link
                    href={`/admin/help?topic=${article.slug}`}
                    className={cn(
                      'block rounded-(--radius) px-2 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'bg-[rgb(var(--primary))] text-white'
                        : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                    )}
                  >
                    {article.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
