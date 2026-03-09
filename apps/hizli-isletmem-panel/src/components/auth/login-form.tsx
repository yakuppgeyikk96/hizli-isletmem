"use client";

import Link from "next/link";
import { useForm, type AnyFieldApi } from "@tanstack/react-form";
import { loginInputSchema } from "@repo/shared/schemas/auth";
import { Mail, LockKeyhole } from "lucide-react";
import { TextInput } from "@/components/ui/text-input";

function getFieldError(field: AnyFieldApi): string | undefined {
  if (!field.state.meta.isTouched || field.state.meta.errors.length === 0) return undefined;
  const first = field.state.meta.errors[0];
  if (!first) return undefined;
  return typeof first === "string" ? first : (first as { message?: string }).message;
}

export function LoginForm() {
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
        <h2 className="text-3xl font-bold text-foreground">Giriş Yap</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Lütfen hesap bilgilerinizi girerek devam edin.
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
              label="E-posta"
              placeholder="E-posta Adresiniz"
              icon={<Mail size={20} />}
              autoComplete="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={getFieldError(field)}
            />
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <TextInput
              id="password"
              name="password"
              type="password"
              label="Parola"
              placeholder="Parolanız"
              icon={<LockKeyhole size={20} />}
              autoComplete="current-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={getFieldError(field)}
            />
          )}
        </form.Field>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="rounded-sm px-1 py-1 text-sm font-medium text-primary-dark transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            Şifremi Unuttum?
          </Link>
        </div>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
              {!isSubmitting && <span aria-hidden="true">&rarr;</span>}
            </button>
          )}
        </form.Subscribe>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Henüz üye değil misiniz?{" "}
        <Link
          href="/register"
          className="rounded-sm px-1 py-0.5 font-semibold text-primary-dark transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          Kaydolun
        </Link>
      </p>
    </div>
  );
}
