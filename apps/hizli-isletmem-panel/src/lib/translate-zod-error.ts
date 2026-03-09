import type { AnyFieldApi } from "@tanstack/react-form";

export function getFieldError(
  field: AnyFieldApi,
  t: (key: string, values?: Record<string, string | number>) => string,
): string | undefined {
  if (!field.state.meta.isTouched || field.state.meta.errors.length === 0) return undefined;
  const first = field.state.meta.errors[0];
  if (!first) return undefined;

  if (typeof first === "string") return first;

  const zodError = first as { code?: string; minimum?: number; maximum?: number };

  switch (zodError.code) {
    case "too_small":
      return t("tooSmall", { minimum: zodError.minimum ?? 1 });
    case "too_big":
      return t("tooBig", { maximum: zodError.maximum ?? 0 });
    case "invalid_string":
      return t("email");
    default:
      return t("required");
  }
}
