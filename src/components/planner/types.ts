export type PlannerItem = {
  id: string;
  emoji: string;
  text: string;
  priority: number; // 0-10
  desire: number; // 0-10
  difficulty: number; // 0-10
  percent: number; // 0-100
};
