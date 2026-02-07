import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  value: string;
  onChange: (emoji: string) => void;
  ariaLabel?: string;
  buttonClassName?: string;
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
};

const EMOJIS = [
  "❤️",
  "✅",
  "🔥",
  "⚡️",
  "⭐️",
  "🚀",
  "🧠",
  "📌",
  "🧹",
  "📝",
  "📚",
  "💼",
  "📈",
  "🛠️",
  "💡",
  "⏳",
  "🎯",
  "🧩",
  "🏃",
  "🧘",
];

export function EmojiPicker({ value, onChange, ariaLabel, buttonClassName, buttonVariant = "outline" }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="inline-block no-elevate shrink-0">
          <Button
            type="button"
            variant={buttonVariant}
            aria-label={ariaLabel ?? "Choose emoji"}
            className={
              "h-11 w-11 justify-center px-0 text-base " + (buttonClassName ?? "")
            }
          >
            <span aria-hidden>{value}</span>
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 rounded-2xl border border-border/60 bg-popover/80 shadow-elev" align="start">
        <div className="grid grid-cols-6 gap-1">
          {EMOJIS.map((e) => (
            <Button
              key={e}
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-2xl text-lg"
              onClick={() => {
                onChange(e);
                setOpen(false);
              }}
              aria-label={`Set emoji ${e}`}
              title={e}
            >
              <span aria-hidden>{e}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
