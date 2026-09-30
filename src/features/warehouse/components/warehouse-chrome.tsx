"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { KeyRound, Languages, LogOut } from "lucide-react";
import { WAREHOUSE_LANG_COOKIE, warehouseCopy, type WarehouseLang } from "../i18n";

export function WarehouseChrome({
  lang,
  userLabel,
  onSignOut,
  children,
}: {
  lang: WarehouseLang;
  userLabel: string;
  onSignOut: () => Promise<void>;
  children: ReactNode;
}) {
  const router = useRouter();
  const t = warehouseCopy[lang];

  function switchLanguage() {
    const next: WarehouseLang = lang === "zh" ? "en" : "zh";
    document.cookie = `${WAREHOUSE_LANG_COOKIE}=${next}; path=/; max-age=${400 * 24 * 60 * 60}; samesite=lax`;
    router.refresh();
  }

  return (
    <div lang={lang === "zh" ? "zh-CN" : "en"} className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-[rgb(var(--border))] bg-[rgb(var(--background))]">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-4">
          <Link href="/admin/warehouse" className="font-display text-base font-semibold">
            A&amp;A <span className="font-normal text-[rgb(var(--muted-foreground))]">{t.title}</span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={switchLanguage}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm hover:bg-[rgb(var(--muted))]"
            >
              <Languages className="h-4 w-4" aria-hidden="true" />
              {t.switchLanguage}
            </button>
            <Link
              href="/admin/warehouse/change-password"
              aria-label={t.changePassword}
              title={t.changePassword}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl hover:bg-[rgb(var(--muted))]"
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
            </Link>
            <form action={onSignOut}>
              <button
                type="submit"
                aria-label={t.signOut}
                title={t.signOut}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl hover:bg-[rgb(var(--muted))]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
        <p className="mx-auto max-w-3xl truncate px-4 pb-2 text-xs text-[rgb(var(--muted-foreground))]">
          {t.signedInAs}: {userLabel}
        </p>
      </header>
      <main id="admin-main" className="mx-auto max-w-3xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
