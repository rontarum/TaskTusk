import * as React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { ArrowDownUp, Download, LayoutGrid, Trash2, Upload } from "lucide-react";
import { PlannerItemForm } from "@/components/planner/PlannerItemForm";
import { PlannerItemList } from "@/components/planner/PlannerItemList";
import { PlannerScoringTable } from "@/components/planner/PlannerScoringTable";
import type { PlannerItem } from "@/components/planner/types";
import { scoreOf } from "@/components/planner/scoring";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { ParallaxLogo } from "@/components/ParallaxLogo";
import { ParallaxFlower } from "@/components/ParallaxFlower";
import { DonateButton } from "@/components/DonateButton";
import { TiltCard } from "@/components/ui/TiltCard";

function uid() {
  return crypto?.randomUUID?.() ?? Math.random().toString(16).slice(2);
}

const STORAGE_KEY = "decision-planner:v1";

const Index = () => {
  const [items, setItems] = useLocalStorageState<PlannerItem[]>(STORAGE_KEY, []);
  const [activeId, setActiveId] = React.useState<string | null>(items[0]?.id ?? null);
  const [sorted, setSorted] = React.useState(false);
  const [tableEditing, setTableEditing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (activeId && items.some((i) => i.id === activeId)) return;
    setActiveId(items[0]?.id ?? null);
  }, [activeId, items]);

  const order = React.useMemo(() => {
    if (!sorted) return items.map((i) => i.id);
    // When editing a value in the table, freeze row order to prevent rows from "jumping".
    if (tableEditing) return items.map((i) => i.id);
    return [...items]
      .sort((a, b) => scoreOf(b) - scoreOf(a))
      .map((i) => i.id);
  }, [items, sorted, tableEditing]);

  function addItem(data: { text: string; emoji: string }) {
    const next: PlannerItem = {
      id: uid(),
      emoji: data.emoji,
      text: data.text,
      priority: 5,
      desire: 5,
      difficulty: 5,
      percent: 0,
    };
    setItems((prev) => [next, ...prev]);
    setActiveId(next.id);
  }

  function updateItem(id: string, patch: Partial<PlannerItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function clearAll() {
    setItems([]);
    setSorted(false);
    setActiveId(null);
  }

  async function downloadTSK() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      items,
    };
    const contents = JSON.stringify(payload, null, 2);

    // Prefer a real "Save As…" dialog when available (Chromium-based browsers)
    try {
      const w = window as unknown as {
        showSaveFilePicker?: (options: {
          suggestedName?: string;
          types?: Array<{ description: string; accept: Record<string, string[]> }>;
        }) => Promise<{ createWritable: () => Promise<{ write: (data: string) => Promise<void>; close: () => Promise<void> }> }>;
      };

      if (typeof w.showSaveFilePicker === "function") {
        const handle = await w.showSaveFilePicker({
          suggestedName: "planner.tsk",
          types: [
            {
              description: "Tasker Planner file",
              accept: {
                "application/json": [".tsk", ".json"],
              },
            },
          ],
        });

        const writable = await handle.createWritable();
        await writable.write(contents);
        await writable.close();
        return;
      }
    } catch {
      // user canceled / unsupported / permission issues → fallback to download
    }

    // Fallback: regular download
    const blob = new Blob([contents], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "planner.tsk";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importTSK(file: File) {
    const text = await file.text();
    const parsed = JSON.parse(text) as { items?: PlannerItem[] };
    if (!Array.isArray(parsed.items)) return;
    setItems(parsed.items);
    setSorted(false);
  }

  return (
    <BackgroundGradientAnimation containerClassName="min-h-screen app-bg bg-transparent">
      <div className="absolute inset-0 z-10 flex flex-col overflow-auto">
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/45 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden">
                <img src="/icon.png" alt="" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-semibold font-heading">TASKTUSK</h1>
                <p className="text-xs text-muted-foreground font-body">Выполняй задачи в верном порядке</p>
              </div>
            </div>


            <div className="flex shrink-0 items-center gap-2">
              <DonateButton />
              <ThemeToggle />
              <input
                ref={fileInputRef}
                type="file"
                accept=".tsk,application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void importTSK(f);
                  e.currentTarget.value = "";
                }}
              />
            </div>
          </div>
        </header>

        {/* Background SVG Logo */}
        <ParallaxLogo />
        <ParallaxFlower />

        <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          {/* Top actions row (content) */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="paper"
                size="sm"
                className="h-9 w-auto min-w-[124px] justify-between gap-3 rounded-xl px-4 text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4 shrink-0" />
                <span className="flex-1 text-right font-body">Открой</span>
              </Button>
              <Button
                variant="paper"
                size="sm"
                className="h-9 w-auto min-w-[124px] justify-between gap-3 rounded-xl px-4 text-xs"
                onClick={downloadTSK}
                disabled={items.length === 0}
              >
                <Download className="size-4 shrink-0" />
                <span className="flex-1 text-right font-body">Сохрани</span>
              </Button>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="paper"
                size="sm"
                className={cn(
                  "h-9 w-auto min-w-[156px] justify-between gap-3 rounded-xl px-4 text-xs transition-all duration-300",
                  sorted && "sort-active"
                )}
                onClick={() => setSorted((s) => !s)}
                disabled={items.length < 2}
              >
                <motion.div
                  animate={{ scaleY: sorted ? -1 : 1 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="size-4 shrink-0"
                >
                  <ArrowDownUp className="size-full" />
                </motion.div>
                <span className="flex-1 text-right font-body">{sorted ? "По очкам" : "Как есть"}</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-9 w-auto min-w-[136px] justify-between gap-3 rounded-xl px-4 text-xs"
                onClick={clearAll}
                disabled={items.length === 0}
              >
                <Trash2 className="size-4 shrink-0" />
                <span className="flex-1 text-right font-body">Убрать всё</span>
              </Button>
            </div>
          </div>

          <div className="grid items-stretch gap-8 lg:grid-cols-[400px_1fr]">
            <section className="flex flex-col">
              <TiltCard className="paper h-full p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-lg font-semibold font-heading">Таски</div>
                  <div className="text-xs text-muted-foreground">{items.length} шт.</div>
                </div>

                <PlannerItemForm onAdd={addItem} />

                <div className="mt-5" style={{ transformStyle: "preserve-3d" }}>
                  <PlannerItemList
                    variant="embedded"
                    items={items}
                    activeId={activeId}
                    onSelect={setActiveId}
                    onDelete={deleteItem}
                    onUpdate={updateItem}
                  />
                </div>
              </TiltCard>
            </section>

            {/* Right */}
            <section className="flex flex-col">
              <PlannerScoringTable
                items={items}
                order={order}
                onUpdate={updateItem}
                onEditingChange={setTableEditing}
              />
            </section>
          </div>
        </main>

        <footer className="mt-auto mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-[10px] text-foreground/50 text-left font-body">
            *Вычисление очков происходит по формуле: (ВАЖНО + надбавки за незавершенность и сложность) × 0.93 + (ХОЧУ + бонусы за прогресс и легкость) × 0.69 + Бонус за легкость × 0.36
          </p>
        </footer>
      </div>
    </BackgroundGradientAnimation>
  );
};

export default Index;
