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

// Returns a CSS color string interpolating: red (#FF4D94) → orange (#FF883D) → green (#2DD4BF).
export function scoreColor(score: number, minScore: number, maxScore: number) {
  if (!Number.isFinite(score) || !Number.isFinite(minScore) || !Number.isFinite(maxScore)) {
    return "rgb(255, 77, 148)"; // Default to red
  }

  const range = maxScore - minScore;
  const t = range <= 0 ? 0.5 : (score - minScore) / range;
  const clamped = Math.min(1, Math.max(0, t));

  // Red: #FF4D94 = rgb(255, 77, 148)
  // Orange: #FF883D = rgb(255, 136, 61)
  // Yellow: rgb(255, 196, 69)
  // Green: #2DD4BF = rgb(45, 212, 191)

  let r: number, g: number, b: number;

  if (clamped < 0.5) {
    // Interpolate from red to orange (0 → 0.5)
    const localT = clamped * 2; // Map 0–0.5 to 0–1
    r = Math.round(255 + (255 - 255) * localT);
    g = Math.round(77 + (196 - 77) * localT);
    b = Math.round(148 + (69 - 148) * localT);
  } else {
    // Interpolate from orange to green (0.5 → 1)
    const localT = (clamped - 0.5) * 2; // Map 0.5–1 to 0–1
    r = Math.round(255 + (45 - 255) * localT);
    g = Math.round(196 + (212 - 196) * localT);
    b = Math.round(69 + (191 - 69) * localT);
  }

  return `rgb(${r}, ${g}, ${b})`;
}
