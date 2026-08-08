"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Input, Label, Textarea, Button } from "@/shared/components/ui";

interface FormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialState: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  message: "",
};

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleChange = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = t("name");
    if (!form.email.trim() || !EMAIL_REGEX.test(form.email)) nextErrors.email = t("email");
    if (!form.message.trim()) nextErrors.message = t("message");
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Request failed");

      setStatus("success");
      setForm(initialState);
    } catch (err) {
      console.error("Contact form submission failed:", err);
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white/80">{t("name")}</Label>
          <Input
            id="name"
            value={form.name}
            onChange={handleChange("name")}
            aria-invalid={!!errors.name}
            className="border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/80">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            aria-invalid={!!errors.email}
            className="border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/40"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white/80">{t("phone")}</Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange("phone")}
            className="border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company" className="text-white/80">{t("company")}</Label>
          <Input
            id="company"
            value={form.company}
            onChange={handleChange("company")}
            className="border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/40"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-white/80">{t("message")}</Label>
        <Textarea
          id="message"
          value={form.message}
          onChange={handleChange("message")}
          aria-invalid={!!errors.message}
          className="border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/40"
        />
      </div>

      <Button
        type="submit"
        variant="accent"
        size="lg"
        disabled={status === "sending"}
        className="w-full sm:w-auto"
      >
        {status === "sending" ? t("sending") : t("submit")}
      </Button>

      {status === "success" && (
        <p className="text-sm text-white">{t("success")}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-400">{t("error")}</p>
      )}
    </form>
  );
}
