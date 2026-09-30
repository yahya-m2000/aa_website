import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError, CredentialsSignin } from "next-auth";
import { homeFor } from "@/core/admin-auth/access";
import { auth, signIn } from "@/core/admin-auth/auth";
import { staffListConfigured } from "@/features/admin-staff/staff.repository";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

// The warehouse worker may not read English, and no language preference exists before sign-in,
// so worker-facing text on this page is shown in both Chinese and English.
const WAREHOUSE_ERRORS: Record<string, { zh: string; en: string }> = {
  invalid: { zh: "用户名或密码不正确。", en: "Incorrect username or password." },
  locked: { zh: "尝试次数过多，账户已锁定 15 分钟。", en: "Too many attempts. Try again in 15 minutes." },
  ended: { zh: "登录已失效，请重新登录。", en: "Your sign-in ended. Please sign in again." },
};

async function warehouseSignIn(formData: FormData) {
  "use server";
  try {
    await signIn("warehouse", {
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin/warehouse",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const code = error instanceof CredentialsSignin && error.code === "locked" ? "locked" : "invalid";
      redirect(`/admin/login?error=${code}#warehouse`);
    }
    throw error;
  }
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user && session.role) redirect(homeFor(session.role));
  const { error } = await searchParams;
  const warehouseError = error ? WAREHOUSE_ERRORS[error] : undefined;
  const showWarehouse = staffListConfigured();

  return (
    <main className="admin-login flex min-h-dvh flex-col px-5 py-6 sm:px-10 sm:py-8">
      <header className="flex items-center gap-3">
        <div className="admin-brand-mark">A&amp;A</div>
        <span className="text-sm font-medium tracking-tight">A&amp;A Trade Solutions</span>
      </header>
      <div className="mx-auto flex w-full max-w-4xl flex-1 items-center py-12">
        <div className="grid w-full overflow-hidden rounded-3xl border border-black/10 bg-white shadow-xl shadow-black/5 md:grid-cols-[0.8fr_1fr]">
          <aside aria-hidden="true" className="relative hidden min-h-[440px] overflow-hidden bg-[#302044] p-10 text-[#e6d9fa] md:flex md:flex-col md:justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.2em]">A&amp;A Admin</span>
            <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full border-[48px] border-[#cab3ee]/20" />
            <div className="relative font-display text-7xl font-medium tracking-tighter">A&amp;A<span className="mt-4 block h-1 w-12 rounded-full bg-[#cab3ee]" /></div>
          </aside>
          <section className="flex flex-col justify-center px-6 py-12 sm:p-12">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-[rgb(var(--muted-foreground))]">Admin portal</p>
            <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">Welcome back</h1>
            <p className="mt-3 max-w-xs text-sm leading-6 text-[rgb(var(--muted-foreground))]">Sign in with your work Microsoft account.</p>
            <form className="mt-8" action={async () => {
              "use server";
              await signIn("microsoft-entra-id", { redirectTo: "/admin" });
            }}>
              <Button type="submit" className="w-full gap-3 px-4" size="lg">
                <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="currentColor">
                  <path d="M0 0h9v9H0zM11 0h9v9h-9zM0 11h9v9H0zM11 11h9v9h-9z" />
                </svg>
                Sign in with Microsoft
              </Button>
            </form>
            {showWarehouse && (
              <div id="warehouse" className="mt-10 border-t border-[rgb(var(--border))] pt-8">
                <h2 className="font-display text-lg font-medium">
                  仓库员工登录 <span className="block text-sm font-normal text-[rgb(var(--muted-foreground))]">Warehouse staff sign-in</span>
                </h2>
                {warehouseError && (
                  <p role="alert" className="mt-4 rounded-xl bg-[rgb(var(--danger-bg))] px-4 py-3 text-sm text-[rgb(var(--danger))]">
                    {warehouseError.zh}
                    <span className="block text-xs">{warehouseError.en}</span>
                  </p>
                )}
                <form action={warehouseSignIn} className="mt-4 space-y-4">
                  <label className="block text-sm">
                    用户名 · Username
                    <Input name="username" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} required maxLength={32} className="mt-1.5" />
                  </label>
                  <label className="block text-sm">
                    密码 · Password
                    <Input name="password" type="password" autoComplete="current-password" required maxLength={200} className="mt-1.5" />
                  </label>
                  <Button type="submit" variant="outline" className="w-full" size="lg">
                    登录 · Sign in
                  </Button>
                </form>
              </div>
            )}
            <p className="mt-6 text-xs leading-5 text-[rgb(var(--muted-foreground))]">Need access? Contact your administrator.</p>
          </section>
        </div>
      </div>
      <footer className="text-center text-xs text-[rgb(var(--muted-foreground))]">
        <Link href="/" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">Back to website</Link>
      </footer>
    </main>
  );
}
