import { BottomSheet } from '@/components/ui/BottomSheet';

interface MobileEmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  currentEmoji: string;
}

const EMOJIS = [
  "❤️", "✅", "🔥", "⚡️", "⭐️", "🚀", "🧠", "📌",
  "🧹", "📝", "📚", "💼", "📈", "🛠️", "💡", "⏳",
  "🎯", "🧩", "🏃", "🧘", "🎨", "🎮", "🎪", "🎭",
  "🎬", "🎤", "🎧", "🎼", "🎹", "🎺", "🎻", "🎲",
  "🏀", "⚽️",
];

export const MobileEmojiPicker = ({ isOpen, onClose, onSelect, currentEmoji }: MobileEmojiPickerProps) => {
  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    // Small delay to allow visual feedback before closing
    setTimeout(() => {
      onClose();
    }, 100);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} enableHistoryIntegration={false}>
      <div className="p-6 pb-8" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-heading font-semibold mb-6">
          Выбери значок
        </h2>

        <div className="grid grid-cols-8 gap-2">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`h-12 w-12 text-2xl rounded-lg transition-colors ${
                emoji === currentEmoji 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(emoji);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
};
