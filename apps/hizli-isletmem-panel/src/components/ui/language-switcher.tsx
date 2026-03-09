"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

const localeLabels: Record<string, string> = {
  tr: "TR",
  en: "EN",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function handleSwitch(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-border bg-background/80 px-2.5 py-1.5 backdrop-blur-sm",
        className,
      )}
    >
      <Languages size={16} className="text-muted-foreground" />
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => handleSwitch(loc)}
          className={cn(
            "min-h-8 min-w-8 rounded-md px-2 py-1 text-xs font-semibold transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
            loc === locale
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
