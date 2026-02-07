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
    <div>
      <div className="flex items-center gap-3">
        <EmojiPicker
          value={emoji}
          onChange={setEmoji}
          ariaLabel="Emoji"
          buttonClassName="h-11 w-11 shrink-0 rounded-xl"
        />

        <Input
          aria-label="Item text"
          placeholder="Новая задача"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          className="h-11 min-w-0 flex-1 rounded-xl px-4"
        />

        <Button
          variant="default"
          size="icon"
          onClick={submit}
          aria-label="Add item"
          title="Добавить"
          className="h-11 w-11 shrink-0 rounded-xl"
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}
