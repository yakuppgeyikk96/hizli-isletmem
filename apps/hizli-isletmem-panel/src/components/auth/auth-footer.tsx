"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function AuthFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-6 text-xs text-muted-foreground">
      <Link
        href="/help"
        className="min-h-11 flex items-center rounded-sm px-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        {t("help")}
      </Link>
      <Link
        href="/privacy"
        className="min-h-11 flex items-center rounded-sm px-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        {t("privacy")}
      </Link>
      <span>{t("copyright")}</span>
    </footer>
  );
}
