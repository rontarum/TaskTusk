import { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useAnimation, AnimatePresence } from 'framer-motion';
import { Star, Heart, Zap, Trash2, Edit, Copy } from 'lucide-react';
import { PlannerItem } from '@/components/planner/types';
import { scoreOf, scoreColor } from '@/components/planner/scoring';
import { ProgressBar } from '@/components/planner/ProgressBar';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  item: PlannerItem;
  minScore?: number;
  maxScore?: number;
  onTap?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  className?: string;
}

export const TaskCard = ({ item, minScore = 0, maxScore = 100, onTap, onEdit, onDelete, onDuplicate, className }: TaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [swipeAction, setSwipeAction] = useState<'edit' | 'delete' | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();
  const score = scoreOf(item);
  const color = scoreColor(score, minScore, maxScore);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTap = () => {
    if (showContextMenu) {
      setShowContextMenu(false);
      return;
    }
    setIsExpanded((prev) => !prev);
    onTap?.(item.id);
  };

  const handleLongPressStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    touchStartRef.current = { x: clientX, y: clientY };

    longPressTimerRef.current = setTimeout(() => {
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      setContextMenuPosition({ x: clientX, y: clientY });
      setShowContextMenu(true);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    touchStartRef.current = null;
  };

  const handleLongPressMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStartRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = Math.abs(clientX - touchStartRef.current.x);
    const deltaY = Math.abs(clientY - touchStartRef.current.y);

    // Cancel long press if moved too much
    if (deltaX > 10 || deltaY > 10) {
      handleLongPressEnd();
    }
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = Math.abs(info.velocity.x);
    const offset = info.offset.x;

    // Execute action if swiped far enough with sufficient velocity
    if (Math.abs(offset) > 100 && velocity > 500) {
      if (offset < 0 && onDelete) {
        // Swipe left → delete
        onDelete(item.id);
        return;
      } else if (offset > 0 && onEdit) {
        // Swipe right → edit
        onEdit(item.id);
        return;
      }
    }

    // Snap back if not executed
    controls.start({ x: 0 });
    setSwipeAction(null);
  };

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    
    // Show action hint when swiped > 30px (earlier feedback)
    if (offset < -30) {
      setSwipeAction('delete');
    } else if (offset > 30) {
      setSwipeAction('edit');
    } else {
      setSwipeAction(null);
    }
  };

  return (
    <div className="relative">
      {/* Background action indicators */}
      {swipeAction === 'delete' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 -inset-y-0.5 bg-destructive rounded-3xl flex items-center justify-end px-6"
        >
          <Trash2 className="w-6 h-6 text-destructive-foreground" />
        </motion.div>
      )}
      {swipeAction === 'edit' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 -inset-y-0.5 bg-primary rounded-3xl flex items-center justify-start px-6"
        >
          <Edit className="w-6 h-6 text-primary-foreground" />
        </motion.div>
      )}

      {/* Context Menu */}
      {showContextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowContextMenu(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed z-50 bg-background border border-border rounded-2xl shadow-lg overflow-hidden"
            style={{
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
              minWidth: 200,
            }}
          >
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(item.id);
                  setShowContextMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
              >
                <Edit className="w-4 h-4" />
                <span>Редактировать</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  onDelete(item.id);
                  setShowContextMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить</span>
              </button>
            )}
            {onDuplicate && (
              <button
                onClick={() => {
                  onDuplicate(item.id);
                  setShowContextMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
              >
                <Copy className="w-4 h-4" />
                <span>Дублировать</span>
              </button>
            )}
          </motion.div>
        </>
      )}

      {/* Card */}
      <motion.div
        layout
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchMove={handleLongPressMove}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseMove={handleLongPressMove}
        className={cn('paper p-4 cursor-pointer select-none relative z-10', className)}
        onClick={handleTap}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
      {/* Header: Emoji + Name + Score */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-2xl flex-shrink-0">{item.emoji}</span>
          <h3 className="font-heading font-semibold text-base line-clamp-2 break-words">
            {item.text}
          </h3>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-2xl font-numbers font-bold" style={{ color }}>
            {score.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <ProgressBar value={item.percent} className="w-full" />
      </div>

      {/* Visual Indicators (compact) */}
      {!isExpanded && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span className="font-numbers">{item.priority}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span className="font-numbers">{item.desire}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span className="font-numbers">{item.difficulty}</span>
          </div>
        </div>
      )}

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="space-y-2 pt-2 border-t border-border overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ВАЖНО</span>
              <span className="text-sm font-numbers font-semibold">{item.priority}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ХОЧУ</span>
              <span className="text-sm font-numbers font-semibold">{item.desire}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">СЛОЖНО</span>
              <span className="text-sm font-numbers font-semibold">{item.difficulty}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ПРОЦЕНТ</span>
              <span className="text-sm font-numbers font-semibold">{item.percent}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </div>
  );
};
