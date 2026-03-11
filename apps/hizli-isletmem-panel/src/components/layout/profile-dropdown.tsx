"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { CircleUser, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { logoutAction } from "@/lib/actions/auth";

export function ProfileDropdown() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdown]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDropdown();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDropdown]);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logoutAction();
    router.push("/login");
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex h-11 w-11 items-center justify-center rounded-full
                   text-muted-foreground transition-colors hover:bg-muted
                   hover:text-foreground focus:outline-none focus:ring-2
                   focus:ring-ring focus:ring-offset-2"
        aria-label={t("logout")}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <CircleUser className="h-6 w-6" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-48 rounded-lg border
                     border-border bg-background shadow-lg"
        >
          <div className="p-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2.5
                         text-sm text-red-600 transition-colors hover:bg-muted
                         disabled:pointer-events-none disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? t("loggingOut") : t("logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
