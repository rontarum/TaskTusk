import { ReactNode, useEffect, useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  fullScreen?: boolean;
  className?: string;
}

export const BottomSheet = ({
  isOpen,
  onClose,
  children,
  fullScreen = false,
  className,
}: BottomSheetProps) => {
  const controls = useAnimation();
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Animate in
      controls.start({ y: 0, opacity: 1 });

      // Focus trap
      const focusableElements = sheetRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, controls]);

  // Handle iOS keyboard
  useEffect(() => {
    if (!isOpen) return;

    const handleVisualViewport = () => {
      if (window.visualViewport && sheetRef.current) {
        const viewportHeight = window.visualViewport.height;
        sheetRef.current.style.height = `${viewportHeight}px`;
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewport);
      handleVisualViewport();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewport);
      }
    };
  }, [isOpen]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    // Close if swiped down with sufficient velocity or distance
    if (velocity > 500 || offset > 150) {
      onClose();
    } else {
      // Snap back
      controls.start({ y: 0 });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black"
      />

      {/* Sheet */}
      <motion.div
        ref={sheetRef}
        initial={{ y: '100%', opacity: 0 }}
        animate={controls}
        exit={{ y: '100%', opacity: 0 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={handleDragEnd}
        transition={{ type: 'spring', damping: 40, stiffness: 400 }}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl',
          fullScreen ? 'top-0 rounded-none' : 'max-h-[90vh]',
          className
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Content */}
        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: fullScreen ? '100%' : 'calc(90vh - 2rem)' }}>
          {children}
        </div>
      </motion.div>
    </>
  );
};
