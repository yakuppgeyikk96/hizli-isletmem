"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";

export function DashboardHeader() {
  const tCommon = useTranslations("common");
  const tDashboard = useTranslations("dashboard");

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-border bg-background px-4 md:px-6">
      <span className="text-lg font-semibold text-foreground">
        {tCommon("appName")}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full
                     text-muted-foreground transition-colors hover:bg-muted
                     hover:text-foreground focus:outline-none focus:ring-2
                     focus:ring-ring focus:ring-offset-2"
          aria-label={tDashboard("notifications")}
        >
          <Bell className="h-5 w-5" />
        </button>

        <ProfileDropdown />
      </div>
    </header>
  );
}
