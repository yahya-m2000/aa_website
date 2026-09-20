import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AdminBackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-sm text-[rgb(var(--muted-foreground))] transition-colors hover:text-[rgb(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-white transition-colors group-hover:bg-[rgb(var(--muted))]">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
      </span>
      {children}
    </Link>
  );
}
