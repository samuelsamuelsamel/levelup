import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { inputStyles } from "@/components/ui/Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => (
  <textarea
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      inputStyles,
      "min-h-[88px] resize-y",
      invalid ? "border-red-800" : "border-base-600",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
