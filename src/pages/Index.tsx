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
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
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
const PWA_PROMPT_DISMISSED_KEY = "tasktusk:pwa-prompt-dismissed";

// Type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

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
  const [sortDelayPending, setSortDelayPending] = React.useState(false);
  const [completingItemId, setCompletingItemId] = React.useState<string | null>(null);
  const [desktopCompletingItemId, setDesktopCompletingItemId] = React.useState<string | null>(null);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = React.useState(false);
  const [pwaPromptDismissed, setPwaPromptDismissed] = useLocalStorageState<boolean>(PWA_PROMPT_DISMISSED_KEY, false);
  const deferredPromptRef = React.useRef<BeforeInstallPromptEvent | null>(null);
  const sortDelayTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktopCompletionTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const frozenOrderRef = React.useRef<string[] | null>(null); // Store order before changes
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const deviceInfo = useDevice();
  const { settings } = useMobileSettings();
  useMobileOptimizations(); // Apply mobile optimizations
  const isMobile = deviceInfo.type === 'mobile';
  const isDesktop = deviceInfo.type === 'desktop';

  // Determine background animation complexity
  const bgComplexity = React.useMemo(() => {
    if (deviceInfo.capabilities.reducedMotion) return 'minimal';
    if (isMobile) return settings.enhancedEffects ? 'full' : 'minimal';
    if (deviceInfo.type === 'tablet') return 'reduced';
    return 'full';
  }, [deviceInfo.type, deviceInfo.capabilities.reducedMotion, isMobile, settings.enhancedEffects]);

  React.useEffect(() => {
    if (activeId && items.some((i) => i.id === activeId)) return;
    setActiveId(items[0]?.id ?? null);
  }, [activeId, items]);

  // PWA install prompt handling
  React.useEffect(() => {
    // Only handle on mobile devices
    if (!isMobile) return;

    // DEBUG: Always show the prompt for testing
    // Show after a short delay to allow the app to render
    const timer = setTimeout(() => {
      setIsPWAInstallOpen(true);
    }, 1500);

    // Always listen for the beforeinstallprompt event to capture it
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };

    /* Original logic - uncomment after debugging:
    // Check if already installed (display-mode: standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone || pwaPromptDismissed) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      // Show our custom prompt after a short delay
      setTimeout(() => {
        setIsPWAInstallOpen(true);
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
    */
  }, [isMobile]);

  const handlePWAInstall = async () => {
    if (!deferredPromptRef.current) return;

    // Show the browser's install prompt
    void deferredPromptRef.current.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPromptRef.current.userChoice;

    if (outcome === 'accepted') {
      // User accepted the install
      deferredPromptRef.current = null;
    }

    setIsPWAInstallOpen(false);
  };

  const handlePWADismiss = () => {
    setPwaPromptDismissed(true);
    setIsPWAInstallOpen(false);
  };

  // Delay sorting by 1 second after item updates (only on desktop)
  React.useEffect(() => {
    // Only apply on desktop (not mobile) and when sorted is enabled
    if (!sorted || isMobile) {
      if (sortDelayTimerRef.current) {
        clearTimeout(sortDelayTimerRef.current);
        sortDelayTimerRef.current = null;
      }
      frozenOrderRef.current = null;
      setSortDelayPending(false);
      return;
    }
  }, [sorted, isMobile]);

  // Freeze current order when items are about to change (on desktop with sorted enabled)
  const freezeOrderForDelay = React.useCallback(() => {
    if (!sorted || isMobile) return;

    // Capture current order before the change
    if (!frozenOrderRef.current) {
      frozenOrderRef.current = [...items]
        .sort((a, b) => scoreOf(b) - scoreOf(a))
        .map((i) => i.id);
      setSortDelayPending(true);
    }

    // Reset timer if already active
    if (sortDelayTimerRef.current) {
      clearTimeout(sortDelayTimerRef.current);
    }

    sortDelayTimerRef.current = setTimeout(() => {
      frozenOrderRef.current = null;
      sortDelayTimerRef.current = null;
      setSortDelayPending(false);
    }, 1000);
  }, [sorted, isMobile, items]);

  const order = React.useMemo(() => {
    if (!sorted) return items.map((i) => i.id);

    // When sort delay is pending, return frozen order from before the change
    if (sortDelayPending && frozenOrderRef.current) {
      return frozenOrderRef.current;
    }

    return [...items]
      .sort((a, b) => scoreOf(b) - scoreOf(a))
      .map((i) => i.id);
  }, [items, sorted, sortDelayPending]);

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
    freezeOrderForDelay();

    // Check if this is a desktop completion (percent === 100)
    if (!isMobile && patch.percent === 100) {
      const item = items.find((it) => it.id === id);
      if (item && item.percent !== 100) {
        // Clear any existing completion timer
        if (desktopCompletionTimerRef.current) {
          clearTimeout(desktopCompletionTimerRef.current);
        }
        // Set a 1000ms delay before triggering completion animation
        desktopCompletionTimerRef.current = setTimeout(() => {
          setDesktopCompletingItemId(id);
        }, 1000);
      }
    }

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
      // Check if completing (percent = 100) and is on mobile
      const isCompleting = data.percent === 100 && isMobile;

      if (isCompleting) {
        // Update the item with the new data
        updateItem(editingItem.id, data);
        // Close form first
        setIsMobileFormOpen(false);
        setEditingItem(undefined);
        // Trigger completion animation after 600ms delay
        setTimeout(() => {
          setCompletingItemId(editingItem.id);
        }, 1000);
      } else {
        updateItem(editingItem.id, data);
      }
    } else {
      addItemMobile(data);
    }
  }

  // Handle completion animation finish
  function handleCompletingItemComplete() {
    if (completingItemId) {
      deleteItem(completingItemId);
      setCompletingItemId(null);
    }
  }

  // Handle desktop completion animation finish
  function handleDesktopCompletingItemComplete() {
    if (desktopCompletingItemId) {
      deleteItem(desktopCompletingItemId);
      setDesktopCompletingItemId(null);
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
      containerClassName="h-[100dvh] w-full app-bg bg-transparent overflow-hidden"
      complexity={bgComplexity}
    >
      <div className="absolute inset-0 z-10 flex flex-col overflow-x-hidden overflow-y-auto overscroll-contain">
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
                      completingItemId={desktopCompletingItemId || undefined}
                      onCompletingItemComplete={handleDesktopCompletingItemComplete}
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
                completingItemId={completingItemId || undefined}
                onCompletingItemComplete={handleCompletingItemComplete}
                desktopCompletingItemId={desktopCompletingItemId || undefined}
                onDesktopCompletingItemComplete={handleDesktopCompletingItemComplete}
              />
            </section>
          </div>
        </main>

        {/* Mobile FAB and Sort Button */}
        {isMobile && (
          <>
            {/* Sort Button */}
            <motion.button
              className={cn(
                "fixed bottom-4 right-20 z-30 w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-colors",
                sorted ? "bg-primary/20 text-primary border border-primary" : "bg-background/80 backdrop-blur-sm text-foreground border border-border"
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
              className="fixed bottom-4 right-4 z-30 w-14 h-14 bg-primary text-primary-foreground rounded-2xl shadow-lg flex items-center justify-center"
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

        {/* PWA Install Prompt */}
        <PWAInstallPrompt
          isOpen={isPWAInstallOpen}
          onClose={handlePWADismiss}
          onInstall={handlePWAInstall}
        />
      </div>
    </BackgroundGradientAnimation>
  );
};

export default Index;
