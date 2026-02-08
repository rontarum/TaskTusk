import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { PlannerItem } from "./types";
import { clampNumber } from "./scoring";

type Props = {
  value: number;
  id: string;
  field: keyof Pick<PlannerItem, "priority" | "desire" | "difficulty" | "percent">;
  min: number;
  max: number;
  step: number;
  ariaLabel: string;
  onUpdate: (id: string, patch: Partial<PlannerItem>) => void;
  className?: string;
  squashX?: MotionValue<number>;
  squashY?: MotionValue<number>;
};

function numberFromInput(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

export function ScoreInput({ value, id, field, min, max, step, ariaLabel, onUpdate, className, squashX: propSquashX, squashY: propSquashY }: Props) {
  // Local squash for direct wheel interaction
  const localWheelValue = useMotionValue(0);
  const localWheelSpring = useSpring(localWheelValue, { stiffness: 400, damping: 15 });
  const localSquashX = useTransform(localWheelSpring, [0, 1], [1, 1.15]);
  const localSquashY = useTransform(localWheelSpring, [0, 1], [1, 0.85]);

  // Combine animations if prop is provided, otherwise use local
  const combinedScaleX = useTransform(
    [propSquashX || localSquashX, localSquashX],
    ([p, l]) => {
      // If prop is provided, 'p' is the prop value. If not, it's just the local value.
      const deltaP = (p as number) - 1;
      const deltaL = propSquashX ? (l as number) - 1 : 0;
      return 1 + deltaP + deltaL;
    }
  );

  const combinedScaleY = useTransform(
    [propSquashY || localSquashY, localSquashY],
    ([p, l]) => {
      const deltaP = (p as number) - 1;
      const deltaL = propSquashY ? (l as number) - 1 : 0;
      return 1 + deltaP + deltaL;
    }
  );

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    function handleWheelNative(e: WheelEvent) {
      // Prevent the page from scrolling
      e.preventDefault();
      e.stopPropagation();

      const direction = e.deltaY > 0 ? -1 : 1;
      // Use the current value from the prop to calculate the next
      const next = clampNumber(value + direction * step, min, max);
      onUpdate(id, { [field]: next } as Partial<PlannerItem>);

      // Trigger local squash
      localWheelValue.set(1);
      setTimeout(() => localWheelValue.set(0), 40);
    }

    el.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", handleWheelNative);
  }, [id, field, value, min, max, step, onUpdate, localWheelValue]);

  return (
    <motion.div
      style={{
        scaleX: combinedScaleX,
        scaleY: combinedScaleY,
        z: 0,
        transformStyle: "preserve-3d"
      }}
      className={cn(
        "group relative rounded-2xl border border-border/30 bg-background/35 transition-colors origin-center",
        "shadow-[0_1px_0_hsl(var(--foreground)_/_0.03)]",
        // bottom highlight line (shorter, like in reference)
        "after:pointer-events-none after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px after:bg-buttonOutline/70",
        "focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15",
        className,
      )}
    >
      <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }} className="h-full w-full">
        <input
          ref={inputRef}
          aria-label={ariaLabel}
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) =>
            onUpdate(id, {
              [field]: clampNumber(numberFromInput(e.target.value), min, max),
            } as Partial<PlannerItem>)
          }
          className={cn(
            "h-10 w-full bg-transparent px-3 text-center text-xs font-medium font-numbers tabular-nums",
            "outline-none placeholder:text-muted-foreground",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          )}
        />
      </div>
    </motion.div>
  );
}
