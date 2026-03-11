import type { SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  icon?: ReactNode;
  label?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  className?: string;
}

export function SelectInput({
  icon,
  label,
  error,
  placeholder,
  options,
  id,
  className,
  value,
  ...props
}: SelectInputProps) {
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
        <select
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          value={value}
          className={cn(
            "w-full appearance-none rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground",
            "outline-none transition-colors",
            "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30",
            error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30",
            !value && "text-muted-foreground",
            icon && "pl-12",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
