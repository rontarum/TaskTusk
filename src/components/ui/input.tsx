import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-2xl border-2 border-input/60 bg-background/60 px-4 py-2 text-base ring-offset-background shadow-xs transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground outline-none focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm cursor-text",
            className,
          )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
