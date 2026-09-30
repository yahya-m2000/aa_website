import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn } from "@/core/admin-auth/auth";
import { passwordProblem } from "@/core/admin-auth/passwords";
import { requireWarehousePage } from "@/core/admin-auth/session";
import { changeOwnPassword, StaffAccountError } from "@/features/admin-staff/staff.repository";
import { getWarehouseCopy } from "@/features/warehouse/language";
import type { WarehouseCopy } from "@/features/warehouse/i18n";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export const metadata = { title: "Change password — A&A" };

const PATH = "/admin/warehouse/change-password";
const ERROR_TEXT: Record<string, (t: WarehouseCopy) => string> = {
  mismatch: (t) => t.passwordMismatch,
  short: (t) => t.passwordTooShort,
  username: (t) => t.passwordHasUsername,
  wrong: (t) => t.passwordWrong,
  same: (t) => t.passwordSame,
};

async function changePassword(formData: FormData) {
  "use server";
  const { account } = await requireWarehousePage({ allowPasswordChange: true });
  if (!account) redirect("/admin");
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next !== String(formData.get("repeat") ?? "")) redirect(`${PATH}?error=mismatch`);
  const problem = passwordProblem(next, account.username);
  if (problem) redirect(`${PATH}?error=${problem.includes("username") ? "username" : "short"}`);
  try {
    await changeOwnPassword(account.username, current, next);
  } catch (error) {
    if (error instanceof StaffAccountError && error.code === "wrong-password") redirect(`${PATH}?error=wrong`);
    if (error instanceof StaffAccountError && error.code === "same-password") redirect(`${PATH}?error=same`);
    throw error;
  }
  // Changing the password ends every existing session, so issue a fresh one straight away.
  await signIn("warehouse", { username: account.username, password: next, redirectTo: "/admin/warehouse" });
}

export default async function ChangePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { account } = await requireWarehousePage({ allowPasswordChange: true });
  if (!account) redirect("/admin");
  const { t } = await getWarehouseCopy();
  const { error } = await searchParams;
  const message = error ? ERROR_TEXT[error]?.(t) : undefined;

  return (
    <div className="mx-auto max-w-md space-y-5">
      <header>
        <h1 className="font-display text-2xl font-semibold">{t.passwordTitle}</h1>
        <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
          {account.mustChangePassword ? t.passwordForced : t.passwordVoluntary}
        </p>
      </header>
      {message && (
        <p role="alert" className="rounded-xl bg-[rgb(var(--danger-bg))] px-4 py-3 text-sm text-[rgb(var(--danger))]">{message}</p>
      )}
      <form action={changePassword} className="space-y-4 rounded-2xl border border-[rgb(var(--border))] bg-white p-4">
        <input type="text" name="username" autoComplete="username" value={account.username} readOnly hidden />
        <label className="block text-sm">
          {t.currentPassword}
          <Input name="current" type="password" autoComplete="current-password" required maxLength={200} className="mt-1.5" />
        </label>
        <label className="block text-sm">
          {t.newPassword}
          <Input name="next" type="password" autoComplete="new-password" required minLength={10} maxLength={200} className="mt-1.5" />
        </label>
        <label className="block text-sm">
          {t.repeatPassword}
          <Input name="repeat" type="password" autoComplete="new-password" required minLength={10} maxLength={200} className="mt-1.5" />
        </label>
        <Button type="submit" size="lg" className="w-full">{t.savePassword}</Button>
      </form>
      {!account.mustChangePassword && (
        <Link href="/admin/warehouse" className="inline-flex min-h-11 items-center text-sm text-[rgb(var(--muted-foreground))]">{t.back}</Link>
      )}
    </div>
  );
}
