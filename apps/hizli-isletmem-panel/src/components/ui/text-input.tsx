import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  label?: string;
  error?: string;
  className?: string;
}

export function TextInput({
  icon,
  label,
  error,
  id,
  className,
  ...props
}: TextInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "w-full rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground",
            "placeholder:text-muted-foreground",
            "outline-none transition-colors",
            "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30",
            error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30",
            icon && "pl-12",
            className,
          )}
          {...props}
        />
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
