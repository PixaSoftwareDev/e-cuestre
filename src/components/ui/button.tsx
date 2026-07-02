import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-brand text-sm font-medium transition-[transform,filter,box-shadow,background-position] duration-200 ease-[var(--ease-smooth)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        primary:
          "sheen bg-primary text-primary-fg hover:brightness-110 hover:-translate-y-0.5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)]",
        accent:
          "sheen bg-accent text-primary-fg hover:brightness-105 hover:-translate-y-0.5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)]",
        outline:
          "border border-fg/20 bg-transparent text-fg hover:bg-fg/5 hover:border-fg/40",
        ghost: "bg-transparent text-fg hover:bg-fg/5",
        subtle: "bg-card text-fg border border-border hover:border-fg/30",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-9 px-4 text-xs tracking-wide",
        md: "h-11 px-6",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Muestra un spinner y deshabilita el botón. (No aplica con asChild.) */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={asChild ? undefined : disabled || loading}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
