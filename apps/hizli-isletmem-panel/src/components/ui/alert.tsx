import type { HTMLAttributes, ReactNode } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "success" | "error" | "warning" | "info";

const variantStyles: Record<AlertVariant, string> = {
  success:
    "border-l-green-500 bg-green-50 text-green-800 dark:border-l-green-400 dark:bg-green-950 dark:text-green-200",
  error:
    "border-l-red-500 bg-red-50 text-red-800 dark:border-l-red-400 dark:bg-red-950 dark:text-red-200",
  warning:
    "border-l-amber-500 bg-amber-50 text-amber-800 dark:border-l-amber-400 dark:bg-amber-950 dark:text-amber-200",
  info:
    "border-l-blue-500 bg-blue-50 text-blue-800 dark:border-l-blue-400 dark:bg-blue-950 dark:text-blue-200",
};

const dismissStyles: Record<AlertVariant, string> = {
  success:
    "text-green-600 hover:bg-green-100 focus-visible:ring-green-500 dark:text-green-300 dark:hover:bg-green-900",
  error:
    "text-red-600 hover:bg-red-100 focus-visible:ring-red-500 dark:text-red-300 dark:hover:bg-red-900",
  warning:
    "text-amber-600 hover:bg-amber-100 focus-visible:ring-amber-500 dark:text-amber-300 dark:hover:bg-amber-900",
  info:
    "text-blue-600 hover:bg-blue-100 focus-visible:ring-blue-500 dark:text-blue-300 dark:hover:bg-blue-900",
};

const variantIcons: Record<AlertVariant, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({
  variant = "info",
  children,
  onDismiss,
  className,
  ...props
}: AlertProps) {
  const Icon = variantIcons[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border-l-4 p-4",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />

      <div className="flex-1 text-sm font-medium">{children}</div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Kapat"
          className={cn(
            "flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
            dismissStyles[variant],
          )}
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
