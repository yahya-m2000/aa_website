"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ArrowUpRight } from "lucide-react";
import { HELP_CATEGORIES } from "../content";

const articles = HELP_CATEGORIES.flatMap((category) =>
  category.articles.map((article) => ({
    ...article,
    category: category.label,
    searchText:
      `${article.title} ${article.body.map((block) => ("text" in block ? block.text : "items" in block ? block.items.join(" ") : block.rows.flat().join(" "))).join(" ")}`.toLowerCase(),
  })),
);

export function HelpSearch() {
  const [query, setQuery] = useState("");
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = terms.length
    ? articles.filter((article) =>
        terms.every((term) => article.searchText.includes(term)),
      )
    : [];
  return (
    <div className="mb-6">
      <label htmlFor="help-search" className="mb-2 block text-xs font-medium">
        Find an answer
      </label>
      <div className="relative">
        <Search
          className="absolute left-4 top-4 h-4 w-4 text-[rgb(var(--muted-foreground))]"
          aria-hidden="true"
        />
        <input
          id="help-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search payments, weighing, notes…"
          className="h-12 w-full rounded-2xl border border-[rgb(var(--input))] pl-11 pr-4 text-sm"
        />
      </div>
      {terms.length > 0 && (
        <div className="mt-3 rounded-2xl border border-[rgb(var(--border))] bg-white p-3">
          <p
            role="status"
            className="px-2 py-2 text-xs text-[rgb(var(--muted-foreground))]"
          >
            {matches.length
              ? `${matches.length} matching article${matches.length === 1 ? "" : "s"}`
              : "No matches. Try a broader term, such as payment or delivery."}
          </p>
          {matches.map((article) => (
            <Link
              key={article.slug}
              href={`/admin/help?topic=${article.slug}`}
              onClick={() => setQuery("")}
              className="flex items-center justify-between gap-3 rounded-xl p-3 hover:bg-[rgb(var(--muted))]"
            >
              <span>
                <span className="block text-sm font-medium">
                  {article.title}
                </span>
                <span className="text-xs text-[rgb(var(--muted-foreground))]">
                  {article.category}
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
