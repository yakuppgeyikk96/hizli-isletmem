"use client";

import { useTranslations } from "next-intl";
import { useForm } from "@tanstack/react-form";
import { loginInputSchema } from "@repo/shared/schemas/auth";
import { Mail, LockKeyhole } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { getFieldError } from "@/lib/translate-zod-error";

export function LoginForm() {
  const t = useTranslations("auth");
  const tValidation = useTranslations("validation");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onBlur: loginInputSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Login:", value);
    },
  });

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground">{t("loginTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("loginSubtitle")}
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
              autoComplete="current-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={getFieldError(field, tValidation)}
            />
          )}
        </form.Field>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="rounded-sm px-1 py-1 text-sm font-medium text-primary-dark transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? t("loginLoading") : t("loginButton")}
              {!isSubmitting && <span aria-hidden="true">&rarr;</span>}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="rounded-sm px-1 py-0.5 font-semibold text-primary-dark transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          {t("register")}
        </Link>
      </p>
    </div>
  );
}
