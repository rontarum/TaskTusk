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
  isFormOpen?: boolean;
}

interface SwipeState {
  isDragging: boolean;
  direction: 'horizontal' | 'vertical' | null;
  startX: number;
  startY: number;
}

export const TaskCard = ({ item, minScore = 0, maxScore = 100, onTap, onEdit, onDelete, onDuplicate, className, isFormOpen }: TaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [swipeAction, setSwipeAction] = useState<'edit' | 'delete' | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isDragging: false,
    direction: null,
    startX: 0,
    startY: 0,
  });
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);
  const prevItemRef = useRef<PlannerItem>(item);
  const prevFormOpenRef = useRef(isFormOpen);
  const score = scoreOf(item);
  const color = scoreColor(score, minScore, maxScore);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Reset card position when item data changes (after edit closes)
  useEffect(() => {
    // Check if item actually changed (not just re-render)
    if (prevItemRef.current.text !== item.text ||
        prevItemRef.current.emoji !== item.emoji ||
        prevItemRef.current.priority !== item.priority ||
        prevItemRef.current.desire !== item.desire ||
        prevItemRef.current.difficulty !== item.difficulty ||
        prevItemRef.current.percent !== item.percent) {
      controls.start({ x: 0 });
      setSwipeAction(null);
      prevItemRef.current = item;
    }
  }, [item, controls]);

  // Reset position when form closes (isFormOpen changes from true to false)
  useEffect(() => {
    if (prevFormOpenRef.current === true && isFormOpen === false) {
      controls.start({ x: 0 });
      setSwipeAction(null);
    }
    prevFormOpenRef.current = isFormOpen;
  }, [isFormOpen, controls]);

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

  const handleDragStart = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setSwipeState({
      isDragging: true,
      direction: null,
      startX: info.point.x,
      startY: info.point.y,
    });
  };

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const deltaX = Math.abs(info.point.x - swipeState.startX);
    const deltaY = Math.abs(info.point.y - swipeState.startY);

    // Directional locking after 15px movement
    if (!swipeState.direction && (deltaX > 15 || deltaY > 15)) {
      const direction = deltaX > deltaY ? 'horizontal' : 'vertical';
      setSwipeState(prev => ({ ...prev, direction }));

      // If vertical, cancel drag and allow scroll
      if (direction === 'vertical') {
        controls.start({ x: 0 });
        setSwipeAction(null);
        return;
      }
    }

    // Only process horizontal swipes
    if (swipeState.direction === 'horizontal') {
      const offset = info.offset.x;

      // Show action hint at 30px
      if (offset < -30) {
        setSwipeAction('delete');
      } else if (offset > 30) {
        setSwipeAction('edit');
      } else {
        setSwipeAction(null);
      }
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const cardWidth = cardRef.current?.getBoundingClientRect().width || 300;
    const threshold = cardWidth * 0.5; // 50% of card width

    // Trigger action if past threshold (regardless of velocity)
    if (Math.abs(offset) > threshold && swipeState.direction === 'horizontal') {
      if (offset < 0 && onDelete) {
        // Delete: fade indicator quickly, then animate card off
        setSwipeAction(null);
        controls.start({
          x: -cardWidth,
          opacity: 0,
          transition: { duration: 0.2, ease: 'easeOut' }
        }).then(() => {
          onDelete(item.id);
        });
        return;
      } else if (offset > 0 && onEdit) {
        // Edit: stay at offset position during edit
        controls.start({ x: 150 });
        onEdit(item.id);
        return;
      }
    }

    // Snap back if not triggered
    controls.start({ x: 0 });
    setSwipeAction(null);
    setSwipeState({ isDragging: false, direction: null, startX: 0, startY: 0 });
  };

  return (
    <div className="relative">
      {/* Background action indicators */}
      <div className="absolute inset-0 -inset-y-0.5 overflow-hidden rounded-3xl">
        <div
          className={cn(
            "absolute inset-0 bg-destructive flex items-center justify-end px-6 transition-opacity duration-200",
            swipeAction === 'delete' ? "opacity-100" : "opacity-0"
          )}
        >
          <Trash2 className="w-6 h-6 text-destructive-foreground" />
        </div>
        <div
          className={cn(
            "absolute inset-0 bg-primary flex items-center justify-start px-6 transition-opacity duration-200",
            swipeAction === 'edit' ? "opacity-100" : "opacity-0"
          )}
        >
          <Edit className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>


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
        ref={cardRef}
        layout
        layoutId={`card-${item.id}`}
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.1}
        dragDirectionLock={true}
        dragPropagation={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchMove={handleLongPressMove}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseMove={handleLongPressMove}
        className={cn('paper p-4 cursor-pointer relative z-10 swipeable', className)}
        onClick={handleTap}
        whileTap={swipeState.isDragging ? undefined : { scale: 0.98 }}
        transition={{ 
          layout: { type: 'spring', stiffness: 300, damping: 30 },
          height: { duration: 0.15, ease: 'easeOut' },
          opacity: { duration: 0.1 }
        }}
        style={{ userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
      >
      {/* Header: Emoji + Name + Score */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-2xl flex-shrink-0">{item.emoji}</span>
          <h3 className="font-heading font-bold text-xl line-clamp-2 break-words">
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
        <div className="flex items-center gap-4 text-sm text-muted-foreground font-semibold">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" strokeWidth={3.6} />
            <span className="font-numbers font-bold">{item.priority}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" strokeWidth={4.0} />
            <span className="font-numbers font-bold">{item.desire}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" strokeWidth={3.0} />
            <span className="font-numbers font-bold">{item.difficulty}</span>
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-2 pt-3 mt-3 border-t border-border/40 overflow-hidden">
          <div className="flex justify-between items-center transition-all duration-300">
            <span className="text-sm text-muted-foreground font-semibold">ВАЖНО?</span>
            <span className="text-sm text-muted-foreground font-numbers font-bold">{item.priority}</span>
          </div>
          <div className="flex justify-between items-center transition-all duration-300">
            <span className="text-sm text-muted-foreground font-semibold">ХОЧУ?</span>
            <span className="text-sm text-muted-foreground font-numbers font-bold">{item.desire}</span>
          </div>
          <div className="flex justify-between items-center transition-all duration-300">
            <span className="text-sm text-muted-foreground font-semibold">СЛОЖНО?</span>
            <span className="text-sm text-muted-foreground font-numbers font-bold">{item.difficulty}</span>
          </div>
          <div className="flex justify-between items-center transition-all duration-300">
            <span className="text-sm text-muted-foreground font-semibold">ГОТОВО%</span>
            <span className="text-sm text-muted-foreground font-numbers font-bold">{item.percent}%</span>
          </div>
        </div>
      )}
    </motion.div>
    </div>
  );
};
