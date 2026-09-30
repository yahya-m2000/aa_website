"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { useToast } from "@/shared/components/ui/toast";
import type { StaffAccountSummary } from "../staff.repository";

const MIN_LENGTH = 10;

async function call(url: string, method: "POST" | "PATCH", body: unknown): Promise<string | null> {
  try {
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (response.ok) return null;
    const json = await response.json().catch(() => null);
    return json?.error?.message ?? "Something went wrong. Please try again.";
  } catch {
    return "Connection lost. Refresh to check the result before trying again.";
  }
}

function PasswordInput({ value, onChange, id }: { value: string; onChange: (value: string) => void; id: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete="new-password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={200}
        className="pr-12"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-1 top-0 flex h-11 w-11 items-center justify-center text-[rgb(var(--muted-foreground))]"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function formatDate(iso?: string) {
  return iso
    ? new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Never";
}

function statusBadges(account: StaffAccountSummary) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge variant={account.active ? "success" : "neutral"}>{account.active ? "Active" : "Disabled"}</Badge>
      {account.locked && <Badge variant="danger">Locked</Badge>}
      {account.active && account.mustChangePassword && <Badge variant="warning">Must set own password</Badge>}
    </div>
  );
}

export function StaffManager({ accounts }: { accounts: StaffAccountSummary[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [confirm, setConfirm] = useState<{ username: string; action: "disable" | "enable" | "unlock" } | null>(null);

  async function run(url: string, method: "POST" | "PATCH", body: unknown, success: string) {
    const error = await call(url, method, body);
    if (error) {
      showToast(error, "error");
      return false;
    }
    showToast(success);
    router.refresh();
    return true;
  }

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    const ok = await run("/api/admin/staff", "POST", { username, displayName, password }, `Created ${username.trim().toLowerCase()}`);
    setCreating(false);
    if (ok) {
      setUsername("");
      setDisplayName("");
      setPassword("");
    }
  }

  return (
    <div className="space-y-8">
      <section className="admin-panel max-w-xl">
        <h2 className="font-display text-lg font-medium">Add warehouse staff</h2>
        <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
          Give them a temporary password. They must choose their own the first time they sign in.
        </p>
        <form onSubmit={create} className="mt-5 space-y-4">
          <label className="block text-sm">
            Username
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={32}
              placeholder="e.g. guangzhou1"
              className="mt-1.5"
              required
            />
          </label>
          <label className="block text-sm">
            Name
            <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={100} placeholder="e.g. Ceng" className="mt-1.5" required />
          </label>
          <label className="block text-sm" htmlFor="new-staff-password">
            Temporary password <span className="text-[rgb(var(--muted-foreground))]">(at least {MIN_LENGTH} characters)</span>
          </label>
          <PasswordInput id="new-staff-password" value={password} onChange={setPassword} />
          <Button type="submit" disabled={creating || password.length < MIN_LENGTH}>
            {creating ? "Creating…" : "Create account"}
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-medium">Warehouse accounts</h2>
        {accounts.length === 0 && <p className="text-sm text-[rgb(var(--muted-foreground))]">No warehouse accounts yet.</p>}
        <div className="grid gap-3 md:grid-cols-2">
          {accounts.map((account) => {
            const locked = account.locked;
            return (
              <article key={account.username} className="admin-panel min-w-0 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="break-words font-medium">{account.displayName}</p>
                    <p className="break-all text-sm text-[rgb(var(--muted-foreground))]">{account.username}</p>
                  </div>
                  {statusBadges(account)}
                </div>
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-[rgb(var(--muted-foreground))]">Last sign-in</dt>
                    <dd className="mt-0.5">{formatDate(account.lastSignInAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-[rgb(var(--muted-foreground))]">Password changed</dt>
                    <dd className="mt-0.5">{formatDate(account.passwordChangedAt)}</dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setResetFor(account.username); setResetPassword(""); }}>
                    Reset password
                  </Button>
                  {locked && (
                    <Button size="sm" variant="outline" onClick={() => setConfirm({ username: account.username, action: "unlock" })}>Unlock</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setConfirm({ username: account.username, action: account.active ? "disable" : "enable" })}>
                    {account.active ? "Disable" : "Enable"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Dialog open={resetFor !== null} onOpenChange={(open) => !open && setResetFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset password for {resetFor}</DialogTitle>
            <DialogDescription>
              They will be signed out on every device and must choose their own password when they next sign in.
            </DialogDescription>
          </DialogHeader>
          <label className="block text-sm" htmlFor="reset-password">Temporary password</label>
          <PasswordInput id="reset-password" value={resetPassword} onChange={setResetPassword} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetFor(null)}>Cancel</Button>
            <Button
              variant="accent"
              disabled={resetPassword.length < MIN_LENGTH}
              onClick={async () => {
                if (resetFor && (await run(`/api/admin/staff/${encodeURIComponent(resetFor)}`, "PATCH", { action: "reset", password: resetPassword }, `Password reset for ${resetFor}`)))
                  setResetFor(null);
              }}
            >
              Reset password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm ? `${confirm.action[0].toUpperCase()}${confirm.action.slice(1)} ${confirm.username}?` : ""}
        description={
          confirm?.action === "disable"
            ? "They will be signed out on every device within a minute and can't sign in until you enable the account again."
            : confirm?.action === "enable"
              ? "They will be able to sign in again with their current password."
              : "Clears the lockout so they can try signing in again straight away."
        }
        confirmLabel={confirm ? `${confirm.action[0].toUpperCase()}${confirm.action.slice(1)}` : "Confirm"}
        destructive={confirm?.action === "disable"}
        onConfirm={async () => {
          if (confirm) await run(`/api/admin/staff/${encodeURIComponent(confirm.username)}`, "PATCH", { action: confirm.action }, "Account updated");
        }}
      />
    </div>
  );
}
