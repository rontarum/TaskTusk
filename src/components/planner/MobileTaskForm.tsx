import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TouchSlider } from '@/components/ui/TouchSlider';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { MobileEmojiPicker } from '@/components/planner/MobileEmojiPicker';
import { PlannerItem } from '@/components/planner/types';

interface MobileTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { text: string; emoji: string; priority: number; desire: number; difficulty: number; percent: number }) => void;
  mode: 'add' | 'edit';
  initialData?: PlannerItem;
}

const PERCENT_OPTIONS = [0, 25, 50, 75, 100];

export const MobileTaskForm = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
}: MobileTaskFormProps) => {
  const [text, setText] = useState(initialData?.text || '');
  const [emoji, setEmoji] = useState(initialData?.emoji || '🎯');
  const [priority, setPriority] = useState(initialData?.priority || 5);
  const [desire, setDesire] = useState(initialData?.desire || 5);
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 5);
  const [percent, setPercent] = useState(initialData?.percent || 0);
  const [error, setError] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile viewport (< 1024px) for mobile-specific behaviors
  useEffect(() => {
    const checkViewport = () => {
      setIsMobileViewport(window.innerWidth < 1024);
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Visual Viewport integration for keyboard handling (mobile-only)
  useEffect(() => {
    if (!isOpen || !isMobileViewport) return;

    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const handleResize = () => {
      // Calculate keyboard height by comparing window height to visual viewport height
      const windowHeight = window.innerHeight;
      const viewportHeight = visualViewport.height;
      const keyboardVisible = windowHeight > viewportHeight;
      
      if (keyboardVisible) {
        const calculatedKeyboardHeight = windowHeight - viewportHeight;
        setKeyboardHeight(calculatedKeyboardHeight);
      } else {
        setKeyboardHeight(0);
      }
    };

    visualViewport.addEventListener('resize', handleResize);
    visualViewport.addEventListener('scroll', handleResize);

    // Initial check
    handleResize();

    return () => {
      visualViewport.removeEventListener('resize', handleResize);
      visualViewport.removeEventListener('scroll', handleResize);
    };
  }, [isOpen, isMobileViewport]);

  useEffect(() => {
    if (initialData) {
      setText(initialData.text);
      setEmoji(initialData.emoji);
      setPriority(initialData.priority);
      setDesire(initialData.desire);
      setDifficulty(initialData.difficulty);
      setPercent(initialData.percent);
    }
  }, [initialData]);

  const handleInputFocus = () => {
    // Scroll input into view when keyboard appears (mobile-only)
    if (!isMobileViewport) return;
    
    if (inputRef.current && containerRef.current) {
      // Use a slight delay to ensure keyboard is visible and viewport has resized
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
        
        // Ensure the Save button remains accessible by scrolling container
        // This helps when keyboard covers the bottom portion
        const container = containerRef.current;
        if (container) {
          const scrollPadding = 100; // Extra space to ensure Save button visibility
          container.scrollTop = Math.min(
            container.scrollTop,
            container.scrollHeight - container.clientHeight - scrollPadding
          );
        }
      }, 300);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Введите название таска');
      return;
    }

    onSubmit({
      text: text.trim(),
      emoji,
      priority,
      desire,
      difficulty,
      percent,
    });

    // Reset form
    setText('');
    setEmoji('🎯');
    setPriority(5);
    setDesire(5);
    setDifficulty(5);
    setPercent(0);
    setError('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent form submission on Enter (mobile keyboards)
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} fullScreen>
      <div 
        ref={containerRef}
        className="p-6" 
        style={{ 
          height: '100dvh',
          paddingBottom: isMobileViewport 
            ? `max(env(safe-area-inset-bottom), ${80 + keyboardHeight}px)` 
            : 'env(safe-area-inset-bottom, 80px)',
          overflow: 'auto',
          overscrollBehavior: isMobileViewport ? 'contain' : 'auto'
        }}
      >
        <h2 className="text-2xl font-heading font-semibold mb-6">
          {mode === 'add' ? 'Новый таск' : 'Изменить таск'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task name */}
          <div>
            <label className="block text-sm font-medium mb-2">Название</label>
            <Input
              ref={inputRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError('');
              }}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder="Назови таск"
              className="text-base"
            />
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
          </div>

          {/* Emoji picker button */}
          <div>
            <label className="block text-sm font-medium mb-2">Значок</label>
            <button
              type="button"
              className="flex items-center justify-center p-3 border border-border rounded-2xl hover:bg-muted transition-colors w-14 h-14"
              onClick={() => setIsEmojiPickerOpen(true)}
            >
              <span className="text-2xl">{emoji}</span>
            </button>
          </div>

          {/* Priority slider */}
          <TouchSlider
            min={0}
            max={10}
            step={1}
            value={priority}
            label="ВАЖНО?"
            onChange={setPriority}
          />

          {/* Desire slider */}
          <TouchSlider
            min={0}
            max={10}
            step={1}
            value={desire}
            label="ХОЧУ?"
            onChange={setDesire}
          />

          {/* Difficulty slider */}
          <TouchSlider
            min={0}
            max={10}
            step={1}
            value={difficulty}
            label="СЛОЖНО?"
            onChange={setDifficulty}
          />

          {/* Percent segmented control */}
          <div>
            <label className="block text-sm font-medium mb-2">ГОТОВО%</label>
            <div className="flex gap-2">
              {PERCENT_OPTIONS.map((option) => {
                const isSelected = percent === option;
                // Color logic: 0,25 = destructive, 50 = gold, 75,100 = primary
                let colorClass = '';
                if (option === 0 || option === 25) {
                  colorClass = isSelected 
                    ? 'bg-destructive text-destructive-foreground' 
                    : 'bg-destructive/10 text-destructive hover:bg-destructive/20';
                } else if (option === 50) {
                  colorClass = isSelected 
                    ? 'bg-[#FFC445] text-black' 
                    : 'bg-[#FFC445]/10 text-[#FFC445] hover:bg-[#FFC445]/20';
                } else {
                  colorClass = isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-primary/10 text-primary hover:bg-primary/20';
                }
                
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPercent(option)}
                    className={`flex-1 py-3 rounded-2xl font-numbers font-semibold transition-colors ${colorClass}`}
                  >
                    {option}%
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
          >
            Сохранить
          </Button>
        </form>

        {/* Mobile Emoji Picker */}
        <MobileEmojiPicker
          isOpen={isEmojiPickerOpen}
          onClose={() => setIsEmojiPickerOpen(false)}
          onSelect={setEmoji}
          currentEmoji={emoji}
        />
      </div>
    </BottomSheet>
  );
};
