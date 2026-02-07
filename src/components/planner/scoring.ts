import type { PlannerItem } from "./types";

export function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function scoreOf(item: Pick<PlannerItem, "priority" | "desire" | "difficulty" | "percent">) {
  // Difficulty input (val) is inverted so that higher val means "more difficult" => lower contribution.
  // C = 10 - val
  const c = item.difficulty;
  const e = item.percent / 100; // 0.N
  const p = item.priority + (item.priority * (1 - e)) + (item.priority * (c / 10));
  const d = item.desire + (item.desire * e) + (item.desire * ((10 - c) / 10));

  return p * 0.93 + d * 0.69 + ((10 - c) * 0.36);
}

// Returns a CSS color string using design tokens for saturation/lightness.
// Hue interpolates 0 (red) -> 120 (green).
export function scoreColor(score: number, minScore: number, maxScore: number) {
  if (!Number.isFinite(score) || !Number.isFinite(minScore) || !Number.isFinite(maxScore)) {
    return "hsl(60 var(--score-sat) var(--score-lit))";
  }

  const range = maxScore - minScore;
  const t = range <= 0 ? 0.5 : (score - minScore) / range;
  const clamped = Math.min(1, Math.max(0, t));
  const hue = 120 * clamped;
  return `hsl(${hue} var(--score-sat) var(--score-lit))`;
}
