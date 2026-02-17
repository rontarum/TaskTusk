import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EmojiPicker } from "./EmojiPicker";

type Props = {
  onAdd: (data: { text: string; emoji: string }) => void;
};

export function PlannerItemForm({ onAdd }: Props) {
  const [text, setText] = React.useState("");
  const [emoji, setEmoji] = React.useState("❤️");

  function submit() {
    const trimmed = text.trim();
    const e = (emoji || "").trim() || "❤️";
    if (!trimmed) return;
    onAdd({ text: trimmed, emoji: e });
    setText("");
  }

  return (
    <div style={{ transformStyle: "preserve-3d" }}>
      <div className="flex items-center gap-3" style={{ transformStyle: "preserve-3d" }}>
        <EmojiPicker
          value={emoji}
          onChange={setEmoji}
          ariaLabel="Emoji"
          buttonClassName="h-11 w-11 shrink-0 rounded-xl"
          style={{ transform: "translateZ(60px)" }}
        />

        <div className="relative flex-1 min-w-0" style={{ transform: "translateZ(60px)", isolation: "isolate" }}>
          <Input
            aria-label="Item text"
            placeholder="Новый таск"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            className="h-11 min-w-0 flex-1 rounded-xl px-4 relative z-10"
          />
        </div>

        <div className="no-elevate" style={{ transform: "translateZ(60px)", transformStyle: "preserve-3d" }}>
          <Button
            variant="default"
            size="icon"
            onClick={submit}
            aria-label="Add item"
            title="Добавить"
            className="relative h-11 w-11 shrink-0 overflow-visible rounded-xl p-0"
            style={{ transform: "translateZ(0px)", transformStyle: "preserve-3d" }}
          >
            <div
              className="flex h-full w-full items-center justify-center pointer-events-none"
              style={{ transform: "translateZ(40px)" }}
            >
              <Plus className="size-5" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
