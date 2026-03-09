import Link from "next/link";

export function AuthFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-6 text-xs text-muted-foreground">
      <Link
        href="/help"
        className="min-h-11 flex items-center rounded-sm px-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        Yardım
      </Link>
      <Link
        href="/privacy"
        className="min-h-11 flex items-center rounded-sm px-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      >
        Politika
      </Link>
      <span>&copy; 2026 Hızlı İşletmem Teknolojileri. Tüm hakları saklıdır.</span>
    </footer>
  );
}
