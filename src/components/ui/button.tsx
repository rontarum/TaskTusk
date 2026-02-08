import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // IMPORTANT: don't use tailwind `transition-*` or `shadow-*` here, they override our hover-elevate motion system.
  "[--elev-shadow:hsl(var(--foreground))] rubber-press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover-elevate active-elevate-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // In the reference, primary buttons read as solid fills (no harsh dark outline)
        default:
          "[--elev-shadow:hsl(var(--primary))] border border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        soft:
          "[--elev-shadow:hsl(var(--secondary))] border border-border/60 bg-secondary/70 text-secondary-foreground hover:bg-secondary/80",
        // Paper-like control: blends with card surfaces (used for top action buttons)
        paper:
          "[--elev-shadow:hsl(var(--card))] border border-border/50 bg-card/70 text-foreground hover:bg-card/80",
        destructive:
          "[--elev-shadow:hsl(var(--destructive))] bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "[--elev-shadow:hsl(var(--background))] border border-buttonOutline bg-background/60 text-foreground hover:bg-accent/50 hover:text-accent-foreground",
        secondary:
          "[--elev-shadow:hsl(var(--secondary))] bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "[--elev-shadow:hsl(var(--accent))] hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-10 rounded-xl px-3",
        lg: "h-12 rounded-xl px-8",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, onMouseDown, ...props }, ref) => {
    const [isAnimating, setIsAnimating] = React.useState(false);

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsAnimating(false);
      // Small delay to re-trigger animation if already in progress
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
      if (onMouseDown) onMouseDown(e);
    };

    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), isAnimating && "animate-rubber")}
        ref={ref}
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onAnimationEnd={() => setIsAnimating(false)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
