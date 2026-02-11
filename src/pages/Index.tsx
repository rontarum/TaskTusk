import * as React from "react";
import { Button } from "@/components/ui/button";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useDevice } from "@/hooks/use-device";
import { useMobileSettings } from "@/hooks/use-mobile-settings";
import { useMobileOptimizations } from "@/hooks/useMobileOptimizations";
import { ArrowDownUp, Download, Trash2, Upload, Plus } from "lucide-react";
import { PlannerItemForm } from "@/components/planner/PlannerItemForm";
import { PlannerItemList } from "@/components/planner/PlannerItemList";
import { ResponsiveScoringTable } from "@/components/planner/ResponsiveScoringTable";
import { ResponsiveHeader } from "@/components/ResponsiveHeader";
import { MobileMenu } from "@/components/MobileMenu";
import { MobileTaskForm } from "@/components/planner/MobileTaskForm";
import { MobileSettingsPanel } from "@/components/MobileSettingsPanel";
import type { PlannerItem } from "@/components/planner/types";
import { scoreOf } from "@/components/planner/scoring";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { ParallaxLogo } from "@/components/ParallaxLogo";
import { ParallaxFlower } from "@/components/ParallaxFlower";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobileFormOpen, setIsMobileFormOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [mobileFormMode, setMobileFormMode] = React.useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = React.useState<PlannerItem | undefined>();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  
  const deviceInfo = useDevice();
  const { settings } = useMobileSettings();
  useMobileOptimizations(); // Apply mobile optimizations
  const isMobile = deviceInfo.type === 'mobile';
  const isDesktop = deviceInfo.type === 'desktop';

  // Determine background animation complexity
  const bgComplexity = React.useMemo(() => {
    if (deviceInfo.capabilities.reducedMotion) return 'minimal';
    if (isMobile) return settings.enhancedEffects ? 'reduced' : 'minimal';
    if (deviceInfo.type === 'tablet') return 'reduced';
    return 'full';
  }, [deviceInfo.type, deviceInfo.capabilities.reducedMotion, isMobile, settings.enhancedEffects]);

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

  function addItemMobile(data: { text: string; emoji: string; priority: number; desire: number; difficulty: number; percent: number }) {
    const next: PlannerItem = {
      id: uid(),
      ...data,
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

  function duplicateItem(id: string) {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    
    const duplicate: PlannerItem = {
      ...item,
      id: uid(),
      text: `${item.text} (копия)`,
    };
    setItems((prev) => [duplicate, ...prev]);
  }

  function handleCardEdit(id: string) {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    
    setEditingItem(item);
    setMobileFormMode('edit');
    setIsMobileFormOpen(true);
  }

  function handleMobileFormSubmit(data: { text: string; emoji: string; priority: number; desire: number; difficulty: number; percent: number }) {
    if (mobileFormMode === 'edit' && editingItem) {
      updateItem(editingItem.id, data);
    } else {
      addItemMobile(data);
    }
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
    <BackgroundGradientAnimation 
      containerClassName="min-h-screen app-bg bg-transparent"
      complexity={bgComplexity}
    >
      <div className="absolute inset-0 z-10 flex flex-col overflow-x-hidden overflow-y-auto">
        <ResponsiveHeader
          deviceType={deviceInfo.type}
          onMenuToggle={() => setIsMobileMenuOpen(true)}
          isBottomSheetOpen={isMobileFormOpen || isSettingsOpen}
        />

        {/* Hidden file input */}
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

        {/* Background SVG Logo & Flower - Desktop only */}
        {isDesktop && !deviceInfo.capabilities.reducedMotion && (
          <>
            <ParallaxLogo />
            <ParallaxFlower />
          </>
        )}

        <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          {/* Desktop/Tablet: Top actions row */}
          {!isMobile && (
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
          )}

          {/* Layout: Mobile stacked, Tablet/Desktop grid */}
          <div className={cn(
            "grid items-stretch gap-8",
            isMobile ? "grid-cols-1" : "lg:grid-cols-[400px_1fr]"
          )}>
            {/* Left: Task input (Desktop/Tablet only) */}
            {!isMobile && (
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
            )}

            {/* Right: Scoring table / Task cards */}
            <section className="flex flex-col">
              <ResponsiveScoringTable
                deviceType={deviceInfo.type}
                items={items}
                order={order}
                onUpdate={updateItem}
                onEditingChange={setTableEditing}
                onCardTap={setActiveId}
                onCardEdit={handleCardEdit}
                onCardDelete={deleteItem}
                onCardDuplicate={duplicateItem}
                isFormOpen={isMobileFormOpen}
              />
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-[10px] text-foreground/50 text-left font-body">
            *Вычисление очков происходит по формуле: (ВАЖНО + надбавки за незавершенность и сложность) × 0.93 + (ХОЧУ + бонусы за прогресс и легкость) × 0.69 + Бонус за легкость × 0.36
          </p>
        </footer>

        {/* Mobile FAB and Sort Button */}
        {isMobile && (
          <>
            {/* Sort Button */}
            <motion.button
              className={cn(
                "fixed bottom-4 right-20 z-30 w-14 h-14 rounded-xl shadow-lg flex items-center justify-center transition-colors",
                sorted ? "bg-primary text-primary-foreground" : "bg-background/80 backdrop-blur-sm text-foreground border border-border"
              )}
              onClick={() => setSorted((s) => !s)}
              disabled={items.length < 2}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ scaleY: sorted ? -1 : 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <ArrowDownUp className="w-5 h-5" />
              </motion.div>
            </motion.button>

            {/* FAB */}
            <motion.button
              className="fixed bottom-4 right-4 z-30 w-14 h-14 bg-primary text-primary-foreground rounded-xl shadow-lg flex items-center justify-center"
              onClick={() => {
                setMobileFormMode('add');
                setEditingItem(undefined);
                setIsMobileFormOpen(true);
              }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </>
        )}

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onImport={() => fileInputRef.current?.click()}
          onExport={downloadTSK}
          onClear={clearAll}
          onSettings={() => setIsSettingsOpen(true)}
        />

        {/* Mobile Task Form */}
        <MobileTaskForm
          isOpen={isMobileFormOpen}
          onClose={() => {
            setIsMobileFormOpen(false);
            setEditingItem(undefined);
          }}
          onSubmit={handleMobileFormSubmit}
          mode={mobileFormMode}
          initialData={editingItem}
        />

        {/* Mobile Settings Panel */}
        <MobileSettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </BackgroundGradientAnimation>
  );
};

export default Index;
