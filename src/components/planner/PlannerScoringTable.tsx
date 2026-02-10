import * as React from "react";
import { cn } from "@/lib/utils";
import type { PlannerItem } from "./types";
import { scoreColor, scoreOf } from "./scoring";
import { ScoreInput } from "./ScoreInput";
import { ProgressBar } from "./ProgressBar";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { TiltCard } from "../ui/TiltCard";

const rowVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

type Props = {
  items: PlannerItem[];
  order: string[];
  onUpdate: (id: string, patch: Partial<PlannerItem>) => void;
  compact?: boolean;
  onEditingChange?: (editing: boolean) => void;
  className?: string;
};

export function PlannerScoringTable({ items, order, onUpdate, compact, onEditingChange, className }: Props) {
  const byId = React.useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const ordered = order.map((id) => byId.get(id)).filter(Boolean) as PlannerItem[];

  // Squash-stretch on wheel
  const wheelValue = useMotionValue(0);
  const wheelSpring = useSpring(wheelValue, { stiffness: 400, damping: 15 });
  const squashX = useTransform(wheelSpring, [0, 1], [1, 1.15]);
  const squashY = useTransform(wheelSpring, [0, 1], [1, 0.85]);

  const wheelTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleWheelGlobal = React.useCallback(() => {
    wheelValue.set(1);
    if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    wheelTimeoutRef.current = setTimeout(() => wheelValue.set(0), 100);
  }, [wheelValue]);

  const rootRef = React.useRef<HTMLDivElement | null>(null);

  function handleFocusCapture(e: React.FocusEvent) {
    if (!(e.target instanceof HTMLInputElement)) return;
    onEditingChange?.(true);
  }

  function handleBlurCapture(e: React.FocusEvent) {
    const next = e.relatedTarget as HTMLElement | null;
    const root = rootRef.current;
    if (root && next && root.contains(next)) return; // still inside table
    onEditingChange?.(false);
  }

  const scores = ordered.map((it) => scoreOf(it));
  const minScore = scores.length ? Math.min(...scores) : 0;
  const maxScore = scores.length ? Math.max(...scores) : 0;

  if (ordered.length === 0) {
    return (
      <TiltCard className="paper p-6">
        <div className="text-sm font-medium font-heading">Оценка</div>
        <p className="mt-1 text-sm text-muted-foreground">Создай несколько задач для оценки и сравнения.</p>
      </TiltCard>
    );
  }

  const rowPadY = compact ? "py-2" : "py-2.5";
  const headerText = "text-[12px] font-semibold tracking-wider text-muted-foreground font-heading";

  return (
    <TiltCard
      ref={rootRef}
      className={cn("paper flex h-full flex-col", className)}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
      onWheel={handleWheelGlobal}
    >
      <div className="px-6 pt-6 pb-4">
        <div className="text-lg font-semibold font-heading">Порядок</div>
      </div>

      {/* Inner table surface (subtle tint + white dividers like in reference) */}
      <div className="mx-6 mb-6 flex-1 rounded-2xl bg-background/25" style={{ transformStyle: "preserve-3d" }}>
        <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          {/* Decorative outer borders shortened by 1.6x, centered with gradient fade */}
          <div
            className="absolute top-0 left-1/2 h-px w-[90.0%] pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to right, transparent, hsl(var(--button-outline) / 0.6), transparent)',
              transform: "translateX(-50%) translateZ(40px)"
            }}
          />
          <div
            className="absolute bottom-0 left-1/2 h-px w-[90.0%] pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to right, transparent, hsl(var(--button-outline) / 0.6), transparent)',
              transform: "translateX(-50%) translateZ(40px)"
            }}
          />
          <div
            className="absolute left-0 top-1/2 w-px h-[90.0%] pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to bottom, transparent, hsl(var(--button-outline) / 0.6), transparent)',
              transform: "translateY(-50%) translateZ(40px)"
            }}
          />
          <div
            className="absolute right-0 top-1/2 w-px h-[90.0%] pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to bottom, transparent, hsl(var(--button-outline) / 0.6), transparent)',
              transform: "translateY(-50%) translateZ(40px)"
            }}
          />

              <div className="px-5 pb-2 pt-4">
                <div className={cn("grid items-center gap-4", "grid-cols-[minmax(280px,1fr)_72px_72px_72px_84px_96px]")}>
                  <div className={headerText}>ТАСК</div>
                  <div className={cn(headerText, "text-center")}>ВАЖНО?</div>
                  <div className={cn(headerText, "text-center")}>ХОЧУ?</div>
                  <div className={cn(headerText, "text-center")}>ТРУДНО?</div>
                  <div className={cn(headerText, "text-center")}>ГОТОВО%</div>
                  <div className={cn(headerText, "text-right")}>ОЧКИ</div>
                </div>
              </div>

              <div className="border-t border-buttonOutline/60" style={{ transform: "translateZ(40px)" }} />

              <AnimatePresence initial={false}>
                {ordered.map((it) => {
                  const score = scoreOf(it);
                  const color = scoreColor(score, minScore, maxScore);

                  return (
                    <motion.div
                      key={it.id}
                      layout
                      variants={rowVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="px-5 py-4 border-b border-buttonOutline/50 last:border-b-0"
                      style={{ transformStyle: "preserve-3d", z: 40 }}
                    >
                      <div
                        className={cn(
                          "grid items-center gap-4",
                          "grid-cols-[minmax(280px,1fr)_72px_72px_72px_84px_96px]",
                        )}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <div className="flex min-w-0 items-center gap-3" style={{ transformStyle: "preserve-3d" }}>
                          <div className="flex-shrink-0" style={{ transform: "translateZ(40px)" }}>
                            <span aria-hidden className="w-7 text-lg">
                              {it.emoji}
                            </span>
                          </div>
                          <div style={{ transform: "translateZ(40px)" }}>
                            <span className="truncate text-sm font-medium text-foreground">{it.text}</span>
                          </div>
                          <ProgressBar
                            className="flex-shrink-0"
                            value={it.percent}
                            squashX={squashX}
                            squashY={squashY}
                          />
                        </div>

                        <ScoreInput
                          id={it.id}
                          field="priority"
                          value={it.priority}
                          min={0}
                          max={10}
                          step={1}
                          ariaLabel={`Priority for ${it.text}`}
                          onUpdate={onUpdate}
                          squashX={squashX}
                          squashY={squashY}
                        />

                        <ScoreInput
                          id={it.id}
                          field="desire"
                          value={it.desire}
                          min={0}
                          max={10}
                          step={1}
                          ariaLabel={`Desire for ${it.text}`}
                          onUpdate={onUpdate}
                          squashX={squashX}
                          squashY={squashY}
                        />

                        <ScoreInput
                          id={it.id}
                          field="difficulty"
                          value={it.difficulty}
                          min={0}
                          max={10}
                          step={1}
                          ariaLabel={`Difficulty for ${it.text}`}
                          onUpdate={onUpdate}
                          squashX={squashX}
                          squashY={squashY}
                        />

                        <ScoreInput
                          id={it.id}
                          field="percent"
                          value={it.percent}
                          min={0}
                          max={100}
                          step={10}
                          ariaLabel={`Percent for ${it.text}`}
                          onUpdate={onUpdate}
                          squashX={squashX}
                          squashY={squashY}
                        />

                        <div className="flex justify-end">
                          <motion.span
                            style={{ color, scaleX: squashX, scaleY: squashY }}
                            className={cn(
                              "inline-flex min-w-[72px] items-center justify-end origin-right",
                              "px-1 text-xs font-bold font-numbers tabular-nums",
                            )}
                            title="Priority + Desire + (10 - Difficulty) + (% / 10)"
                          >
                            {score.toFixed(0)}
                          </motion.span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>


        </div>
      </div>
    </TiltCard>
  );
}
