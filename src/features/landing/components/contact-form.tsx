"use client";

import { useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Input, Label, Textarea, Button } from "@/shared/components/ui";
import { ArrowUpRight, Info } from "lucide-react";
import { socialLinks } from "@/shared/data/social-links";

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
  const ui = useTranslations("experience");
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = ui("invalidName");
    if (!form.email.trim() || !EMAIL_REGEX.test(form.email.trim()))
      nextErrors.email = ui("invalidEmail");
    if (!form.message.trim()) nextErrors.message = ui("invalidMessage");
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first)
      formRef.current?.querySelector<HTMLElement>(`#${first}`)?.focus();
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const subject = t("emailSubject", { name: form.name.trim() });
    const body = [
      `${t("name")}: ${form.name.trim()}`,
      `${t("email")}: ${form.email.trim()}`,
      `${t("phone")}: ${form.phone.trim()}`,
      `${t("company")}: ${form.company.trim()}`,
      "",
      `${t("message")}:`,
      form.message.trim(),
    ]
      .join("\n")
      .replace(/\r?\n/g, "\r\n");

    // Keep the form intact: opening a draft does not confirm that it was sent.
    window.location.assign(
      `mailto:${socialLinks.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
    >
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white/80">
            {t("name")} <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            maxLength={120}
            placeholder={ui("namePlaceholder")}
            value={form.name}
            onChange={handleChange("name")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className="border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/40"
          />
          {errors.name && (
            <p id="name-error" className="trade-field-error">
              {errors.name}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/80">
            {t("email")} <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder={ui("emailPlaceholder")}
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className="border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/40"
          />
          {errors.email && (
            <p id="email-error" className="trade-field-error">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white/80">
            {t("phone")}
          </Label>
          <Input
            id="phone"
            name="phone"
            autoComplete="tel"
            maxLength={40}
            placeholder={ui("phonePlaceholder")}
            type="tel"
            value={form.phone}
            onChange={handleChange("phone")}
            className="border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company" className="text-white/80">
            {t("company")}
          </Label>
          <Input
            id="company"
            name="company"
            autoComplete="organization"
            maxLength={160}
            placeholder={ui("companyPlaceholder")}
            value={form.company}
            onChange={handleChange("company")}
            className="border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/40"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-white/80">
          {t("message")} <span aria-hidden="true">*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          maxLength={5000}
          placeholder={ui("messagePlaceholder")}
          value={form.message}
          onChange={handleChange("message")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          className="border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/40"
        />
        {errors.message && (
          <p id="message-error" className="trade-field-error">
            {errors.message}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          variant="accent"
          size="lg"
          aria-describedby="contact-email-note"
          className="w-full sm:w-auto"
        >
          {t("submit")}
          <ArrowUpRight size={16} />
        </Button>
        <p id="contact-email-note" className="trade-email-note">
          <Info size={16} aria-hidden="true" />
          <span>{t("emailNote")}</span>
        </p>
      </div>
    </form>
  );
}
