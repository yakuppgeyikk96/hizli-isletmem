import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-dark",
  outline:
    "border border-border bg-background text-foreground hover:bg-muted",
  ghost:
    "text-foreground hover:bg-muted",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-2 text-sm",
  default: "min-h-12 px-4 py-3.5 text-base",
  lg: "min-h-14 px-6 py-4 text-lg",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "default",
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2",
        "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
