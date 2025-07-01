import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "inline-flex items-center justify-center animate-spin",
  {
    variants: {
      size: {
        default: "h-4 w-4",
        sm: "h-3 w-3",
        lg: "h-6 w-6",
        xl: "h-8 w-8",
      },
      thickness: {
        default: "border-2",
        sm: "border",
        lg: "border-4",
      },
    },
    defaultVariants: {
      size: "default",
      thickness: "default",
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  spinnerColor?: "primary" | "secondary" | "muted" | "foreground";
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, thickness, spinnerColor, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-full border-solid border-current border-r-transparent",
        spinnerVariants({ size, thickness, className }),
        spinnerColor === "primary" && "text-primary",
        spinnerColor === "secondary" && "text-secondary",
        spinnerColor === "muted" && "text-muted-foreground",
        spinnerColor === "foreground" && "text-foreground"
      )}
      role="status"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
);
Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };