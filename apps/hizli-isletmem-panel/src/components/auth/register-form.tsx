"use client";

import { useTranslations } from "next-intl";
import { useForm } from "@tanstack/react-form";
import { registerInputSchema } from "@repo/shared/schemas/auth";
import { Mail, LockKeyhole, User, Store, Tag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { TextInput } from "@/components/ui/text-input";
import { SelectInput } from "@/components/ui/select-input";
import { Button } from "@/components/ui/button";
import { getFieldError } from "@/lib/translate-zod-error";

export function RegisterForm() {
  const t = useTranslations("auth");
  const tValidation = useTranslations("validation");

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      businessName: "",
      businessType: "" as "restaurant" | "cafe" | "bar" | "patisserie" | "other",
    },
    validators: {
      onBlur: registerInputSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Register:", value);
    },
  });

  const businessTypeOptions = [
    { value: "restaurant", label: t("businessTypeRestaurant") },
    { value: "cafe", label: t("businessTypeCafe") },
    { value: "bar", label: t("businessTypeBar") },
    { value: "patisserie", label: t("businessTypePatisserie") },
    { value: "other", label: t("businessTypeOther") },
  ];

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground">{t("registerTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("registerSubtitle")}
        </p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field name="name">
          {(field) => (
            <TextInput
              id="name"
              name="name"
              type="text"
              label={t("nameLabel")}
              placeholder={t("namePlaceholder")}
              icon={<User size={20} />}
              autoComplete="name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={getFieldError(field, tValidation)}
            />
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <TextInput
              id="email"
              name="email"
              type="email"
              label={t("emailLabel")}
              placeholder={t("emailPlaceholder")}
              icon={<Mail size={20} />}
              autoComplete="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={getFieldError(field, tValidation)}
            />
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <TextInput
              id="password"
              name="password"
              type="password"
              label={t("passwordLabel")}
              placeholder={t("passwordPlaceholder")}
              icon={<LockKeyhole size={20} />}
              autoComplete="new-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={getFieldError(field, tValidation)}
            />
          )}
        </form.Field>

        <form.Field name="businessName">
          {(field) => (
            <TextInput
              id="businessName"
              name="businessName"
              type="text"
              label={t("businessNameLabel")}
              placeholder={t("businessNamePlaceholder")}
              icon={<Store size={20} />}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={getFieldError(field, tValidation)}
            />
          )}
        </form.Field>

        <form.Field name="businessType">
          {(field) => (
            <SelectInput
              id="businessType"
              name="businessType"
              label={t("businessTypeLabel")}
              placeholder={t("businessTypePlaceholder")}
              icon={<Tag size={20} />}
              options={businessTypeOptions}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) =>
                field.handleChange(
                  e.target.value as "restaurant" | "cafe" | "bar" | "patisserie" | "other",
                )
              }
              error={getFieldError(field, tValidation)}
            />
          )}
        </form.Field>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? t("registerLoading") : t("registerButton")}
              {!isSubmitting && <span aria-hidden="true">&rarr;</span>}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link
          href="/login"
          className="rounded-sm px-1 py-0.5 font-semibold text-primary-dark transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
