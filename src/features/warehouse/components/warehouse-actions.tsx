"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { Input } from "@/shared/components/ui/input";
import { useToast } from "@/shared/components/ui/toast";
import { warehouseCopy, type WarehouseLang } from "../i18n";

async function send(url: string, body: Record<string, unknown>): Promise<"ok" | "failed" | "offline"> {
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.status === 401) {
      window.location.href = "/api/admin/auth/signed-out?reason=ended";
      return "failed";
    }
    return response.ok ? "ok" : "failed";
  } catch {
    return "offline";
  }
}

function useSubmit(lang: WarehouseLang) {
  const router = useRouter();
  const { showToast } = useToast();
  const t = warehouseCopy[lang];
  return async (url: string, body: Record<string, unknown>) => {
    const result = await send(url, body);
    if (result === "ok") {
      showToast(t.saved);
      router.refresh();
    } else {
      showToast(result === "offline" ? t.offline : t.failed, "error");
    }
  };
}

function parseWeight(value: string): number | null {
  const weight = Number(value.replace(",", "."));
  return Number.isFinite(weight) && weight > 0 ? Math.round(weight * 1000) / 1000 : null;
}

export function MarkArrivedAction({ reference, etag, lang }: { reference: string; etag: string; lang: WarehouseLang }) {
  const t = warehouseCopy[lang];
  const submit = useSubmit(lang);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="lg" className="w-full" onClick={() => setOpen(true)}>{t.markArrived}</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t.markArrived}
        description={t.confirmArrived}
        confirmLabel={t.confirm}
        cancelLabel={t.cancel}
        onConfirm={() => submit(`/api/admin/warehouse/orders/${encodeURIComponent(reference)}/arrived`, { etag })}
      />
    </>
  );
}

function WeightForm({
  lang,
  label,
  initial,
  onSave,
}: {
  lang: WarehouseLang;
  label: string;
  initial?: number;
  onSave: (weightKg: number) => Promise<void>;
}) {
  const t = warehouseCopy[lang];
  const [value, setValue] = useState(initial ? String(initial) : "");
  const [open, setOpen] = useState(false);
  const weight = parseWeight(value);
  return (
    <>
      <label className="block text-sm font-medium">
        {label}
        <Input
          inputMode="decimal"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="0.0"
          className="mt-2 h-12 text-lg tabular-nums"
        />
      </label>
      <Button size="lg" className="mt-3 w-full" disabled={!weight} onClick={() => setOpen(true)}>
        {t.saveWeight}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t.saveWeight}
        description={t.confirmWeight(String(weight ?? ""))}
        confirmLabel={t.confirm}
        cancelLabel={t.cancel}
        onConfirm={() => (weight ? onSave(weight) : undefined)}
      />
    </>
  );
}

export function OrderWeightAction({ reference, etag, lang, initial }: { reference: string; etag: string; lang: WarehouseLang; initial?: number }) {
  const submit = useSubmit(lang);
  return (
    <WeightForm
      lang={lang}
      label={warehouseCopy[lang].weightLabel}
      initial={initial}
      onSave={(weightKg) => submit(`/api/admin/warehouse/orders/${encodeURIComponent(reference)}/weight`, { etag, weightKg })}
    />
  );
}

export function DeliveryWeightAction({ deliveryKey, etag, lang, initial }: { deliveryKey: string; etag: string; lang: WarehouseLang; initial?: number }) {
  const submit = useSubmit(lang);
  return (
    <WeightForm
      lang={lang}
      label={warehouseCopy[lang].combinedWeightLabel}
      initial={initial}
      onSave={(weightKg) => submit(`/api/admin/warehouse/deliveries/${encodeURIComponent(deliveryKey)}`, { action: "weigh", etag, weightKg })}
    />
  );
}

export function DeliveryDispatchAction({ deliveryKey, etag, lang }: { deliveryKey: string; etag: string; lang: WarehouseLang }) {
  const t = warehouseCopy[lang];
  const submit = useSubmit(lang);
  const [tracking, setTracking] = useState("");
  const [open, setOpen] = useState(false);
  const trimmed = tracking.trim();
  return (
    <>
      <label className="block text-sm font-medium">
        {t.trackingLabel}
        <Input
          value={tracking}
          onChange={(event) => setTracking(event.target.value)}
          maxLength={250}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="mt-2 h-12"
        />
      </label>
      <Button size="lg" className="mt-3 w-full" disabled={trimmed.length < 3} onClick={() => setOpen(true)}>
        {t.dispatch}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t.dispatch}
        description={t.confirmDispatch(trimmed)}
        confirmLabel={t.confirm}
        cancelLabel={t.cancel}
        onConfirm={() => submit(`/api/admin/warehouse/deliveries/${encodeURIComponent(deliveryKey)}`, { action: "ship", etag, tracking: trimmed })}
      />
    </>
  );
}
