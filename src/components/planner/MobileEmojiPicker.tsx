import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/button';

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
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="p-6 pb-8">
        <h2 className="text-2xl font-heading font-semibold mb-6">
          Выбери эмодзи
        </h2>

        <div className="grid grid-cols-8 gap-2">
          {EMOJIS.map((emoji) => (
            <Button
              key={emoji}
              type="button"
              variant={emoji === currentEmoji ? 'default' : 'ghost'}
              size="icon"
              className="h-12 w-12 text-2xl rounded-lg"
              onClick={() => handleSelect(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
};
