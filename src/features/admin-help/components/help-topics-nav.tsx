"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { cn } from "@/core/utils";
import { HELP_CATEGORIES } from "../content";

export function HelpTopicsNav({ activeSlug }: { activeSlug: string }) {
  const router = useRouter();
  return (
    <>
      <div className="lg:hidden">
        <label htmlFor="help-topic" className="mb-2 block text-xs font-medium">
          Browse topics
        </label>
        <select
          id="help-topic"
          value={activeSlug}
          onChange={(e) => router.push(`/admin/help?topic=${e.target.value}`)}
          className="min-h-12 w-full rounded-xl border border-[rgb(var(--input))] px-3 text-sm"
        >
          {HELP_CATEGORIES.map((category) => (
            <optgroup key={category.slug} label={category.label}>
              {category.articles.map((article) => (
                <option key={article.slug} value={article.slug}>
                  {article.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <nav aria-label="Help topics" className="hidden space-y-6 lg:block">
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
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "block rounded-(--radius) px-2 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-[rgb(var(--primary))] text-white"
                          : "text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]",
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
    </>
  );
}
