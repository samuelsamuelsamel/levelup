import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const inputStyles =
  "w-full rounded-lg border bg-base-900 px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-moss-500 disabled:opacity-60";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        inputStyles,
        "h-10",
        invalid ? "border-red-800" : "border-base-600",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
