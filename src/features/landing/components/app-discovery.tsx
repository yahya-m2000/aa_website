"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Smartphone,
  Shirt,
  House,
  Sparkles,
  Gamepad2,
  Volleyball,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { Link } from "@/i18n/routing";

const categories = [
  { key: "electronics", Icon: Smartphone, label: "01" },
  { key: "clothing", Icon: Shirt, label: "02" },
  { key: "home", Icon: House, label: "03" },
  { key: "beauty", Icon: Sparkles, label: "04" },
  { key: "toys", Icon: Gamepad2, label: "05" },
  { key: "sports", Icon: Volleyball, label: "06" },
] as const;

export function AppDiscovery() {
  const t = useTranslations("launch");
  const shop = useTranslations("shop.categories");
  const [selected, setSelected] =
    useState<(typeof categories)[number]["key"]>("electronics");
  const category = categories.find((item) => item.key === selected)!;
  const Icon = category.Icon;
  return (
    <div className="launch-discovery" data-trade-reveal>
      <div
        className="launch-category-selector"
        role="group"
        aria-label={t("chooseCategory")}
      >
        {categories.map(({ key, Icon: CategoryIcon }) => (
          <button
            type="button"
            key={key}
            aria-pressed={selected === key}
            onClick={() => setSelected(key)}
          >
            <CategoryIcon size={20} />
            <span>{shop(key)}</span>
            <Plus size={15} />
          </button>
        ))}
      </div>
      <div
        className={`launch-category-panel launch-category-${selected}`}
        aria-live="polite"
      >
        <div className="launch-category-copy">
          <span className="launch-category-count">{category.label} / 06</span>
          <h3>{t(`categoryStories.${selected}.title`)}</h3>
          <p>{t(`categoryStories.${selected}.body`)}</p>
          <Link href="/download">
            {t("exploreCategory")}
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="launch-category-art" aria-hidden="true">
          <span className="launch-category-orbit" />
          <span className="launch-category-symbol">✦</span>
          <div className="launch-category-object">
            <Icon strokeWidth={0.85} />
          </div>
          <span className="launch-category-label">
            <Icon size={14} />
            {shop(selected)}
          </span>
        </div>
      </div>
    </div>
  );
}
