import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { EmojiPicker } from "./EmojiPicker";
import { DesktopTaskCompletionAnimation } from "./DesktopTaskCompletionAnimation";
import type { PlannerItem } from "./types";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  items: PlannerItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<PlannerItem>) => void;
  variant?: "standalone" | "embedded";
  completingItemId?: string;
  onCompletingItemComplete?: () => void;
};

const itemVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export function PlannerItemList({
  items,
  activeId,
  onSelect,
  onDelete,
  onUpdate,
  variant = "standalone",
  completingItemId,
  onCompletingItemComplete,
}: Props) {
  const isEmbedded = variant === "embedded";

  const [editingTextId, setEditingTextId] = React.useState<string | null>(null);
  const [draftText, setDraftText] = React.useState("");

  function startEditText(id: string, current: string) {
    setEditingTextId(id);
    setDraftText(current);
  }

  function commitText(id: string) {
    const next = draftText.trim();
    if (next) onUpdate(id, { text: next });
    setEditingTextId(null);
  }

  function cancelEdit() {
    setEditingTextId(null);
  }

  if (items.length === 0) {
    if (isEmbedded) {
      return (
        <div className="rounded-2xl bg-background/30 px-4 py-3">
          <div className="text-sm font-medium">Пока нет задач 🤷‍♀️</div>
          <p className="mt-1 text-sm text-muted-foreground">Добавь несколько для начала.</p>
        </div>
      );
    }

    return (
      <div className="paper p-5">
        <div className="text-sm font-medium">Пока нет задач 🤷‍♀️</div>
        <p className="mt-1 text-sm text-muted-foreground">Добавь несколько для начала.</p>
      </div>
    );
  }

  const List = (
    <ul
      className={cn(
        isEmbedded ? "mt-1 space-y-2" : "p-2",
      )}
      style={{ transformStyle: "preserve-3d" }}
    >
      <AnimatePresence initial={false}>
        {items.map((it) => {
          const isActive = it.id === activeId;
          const isEditing = editingTextId === it.id;
          const isCompleting = completingItemId === it.id;

          // If this item is completing, show the completion animation instead
          if (isCompleting) {
            return (
              <motion.li
                key={it.id}
                variants={itemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <DesktopTaskCompletionAnimation
                  item={it}
                  isVisible={true}
                  onComplete={onCompletingItemComplete || (() => {})}
                  className="!transform !translate-z-[40px]"
                />
              </motion.li>
            );
          }

          return (
            <motion.li
              key={it.id}
              layout
              variants={itemVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(it.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSelect(it.id);
                }}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl",
                  "bg-background/35 px-3 py-2",
                  "transition-colors hover:bg-background/55",
                  isActive && "bg-background/70 shadow-xs",
                )}
                style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
              >
                {/* emoji: click to change */}
                <div
                  className="shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <EmojiPicker
                    value={it.emoji}
                    onChange={(emoji) => onUpdate(it.id, { emoji })}
                    ariaLabel={`Emoji for ${it.text}`}
                    style={{ transform: "translateZ(0px)" }}
                    buttonVariant="ghost"
                    buttonClassName={cn(
                      "h-9 w-9 rounded-xl text-base relative overflow-visible",
                      // remove the white outline in light mode; keep it feeling like an embedded control
                      "border-0 bg-transparent shadow-none",
                      "hover:bg-background/35",
                    )}
                  />
                </div>

                {/* text: click to edit */}
                <div className="min-w-0 flex-1" style={{ transformStyle: "preserve-3d" }}>
                  {isEditing ? (
                    <Input
                      autoFocus
                      aria-label={`Edit text for ${it.text}`}
                      value={draftText}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setDraftText(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") commitText(it.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      onBlur={() => commitText(it.id)}
                      className="h-9 rounded-xl px-3 text-sm"
                    />
                  ) : (
                    <button
                      type="button"
                      className="block w-full text-left text-sm whitespace-normal break-words"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditText(it.id, it.text);
                      }}
                      title="Нажми, чтобы изменить"
                      style={{
                        transform: "translateZ(0px)",
                        transformStyle: "preserve-3d"
                      }}
                    >
                      <span className="block" style={{ transform: "translateZ(40px)" }}>
                        {it.text}
                      </span>
                    </button>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(it.id);
                  }}
                  aria-label={`Delete ${it.text}`}
                  title="Удалить"
                  className={cn(
                    // Only fade (no movement)
                    "opacity-0 group-hover:opacity-100",
                    // smooth modulation
                    "transition-[opacity,background-color,color] duration-300",
                    // default: same as main text; hover: red
                    "text-foreground/80 hover:bg-destructive/15 hover:text-destructive",
                    // opt out of global button lift/shadow + rubber press
                    "no-elevate relative overflow-visible",
                  )}
                  style={{ transform: "translateZ(0px)", transformStyle: "preserve-3d" }}
                >
                  <div className="flex h-full w-full items-center justify-center" style={{ transform: "translateZ(40px)" }}>
                    <Trash2 />
                  </div>
                </Button>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );

  if (isEmbedded) return List;

  return <div className="rounded-[28px] border border-border/60 bg-card/60 shadow-soft">{List}</div>;
}
