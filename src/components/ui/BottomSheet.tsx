import { ReactNode, useEffect, useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  fullScreen?: boolean;
  className?: string;
  dragThreshold?: number;
  velocityThreshold?: number;
  enableHistoryIntegration?: boolean;
}

export const BottomSheet = ({
  isOpen,
  onClose,
  children,
  fullScreen = false,
  className,
  dragThreshold = 100,
  velocityThreshold = 300,
  enableHistoryIntegration = true,
}: BottomSheetProps) => {
  const controls = useAnimation();
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Scroll lock with position preservation
  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Lock body scroll (iOS Safari compatible)
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Animate in
      controls.start({ y: 0, opacity: 1 });

      // Focus trap
      const focusableElements = sheetRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
      
      return () => {
        // Restore scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
        
        // Restore focus
        if (previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, controls]);

  // Visual Viewport API integration for keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    const handleVisualViewport = () => {
      if (sheetRef.current) {
        if (window.visualViewport) {
          // Use visual viewport height when available
          const vh = window.visualViewport.height;
          sheetRef.current.style.height = `${vh}px`;
        } else {
          // Fallback to window.innerHeight
          sheetRef.current.style.height = `${window.innerHeight}px`;
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewport);
      window.visualViewport.addEventListener('scroll', handleVisualViewport);
      handleVisualViewport();
      
      return () => {
        window.visualViewport.removeEventListener('resize', handleVisualViewport);
        window.visualViewport.removeEventListener('scroll', handleVisualViewport);
      };
    } else {
      // Fallback for browsers without Visual Viewport API
      window.addEventListener('resize', handleVisualViewport);
      handleVisualViewport();
      
      return () => {
        window.removeEventListener('resize', handleVisualViewport);
      };
    }
  }, [isOpen]);

  // Browser history integration
  useEffect(() => {
    if (!isOpen || !enableHistoryIntegration) return;
    
    const historyKey = `bottomsheet-${Date.now()}`;
    
    try {
      // Push state when opening
      window.history.pushState({ bottomSheet: historyKey }, '');
      
      const handlePopState = (e: PopStateEvent) => {
        if (e.state?.bottomSheet === historyKey) {
          onClose();
        }
      };
      
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
        // Clean up history if still open
        try {
          if (window.history.state?.bottomSheet === historyKey) {
            window.history.back();
          }
        } catch (err) {
          console.warn('Failed to clean up history state:', err);
        }
      };
    } catch (err) {
      console.warn('History API not available:', err);
    }
  }, [isOpen, onClose, enableHistoryIntegration]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    // Close if swiped down with sufficient velocity or distance (improved thresholds)
    if (velocity > velocityThreshold || offset > dragThreshold) {
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
        style={{ touchAction: 'none' }}
      />

      {/* Sheet */}
      <motion.div
        ref={sheetRef}
        initial={{ y: '100%', opacity: 0 }}
        animate={controls}
        exit={{ y: '100%', opacity: 0 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.2 }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        transition={{ type: 'spring', damping: 35, stiffness: 350, mass: 0.5 }}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl bottom-sheet',
          fullScreen ? 'top-0 rounded-none' : '',
          className
        )}
        style={{
          height: fullScreen ? '100dvh' : 'auto',
          maxHeight: fullScreen ? '100dvh' : '90dvh',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y'
        }}
      >
        {/* Drag handle - increased hit area */}
        <motion.div 
          className="flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing" 
          style={{ minHeight: '48px' }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.2 }}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
        >
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full pointer-events-none" />
        </motion.div>

        {/* Content */}
        <div 
          className="overflow-y-auto overscroll-contain px-6 pb-8" 
          style={{ 
            maxHeight: fullScreen ? 'calc(100dvh - 48px)' : 'calc(90dvh - 48px)',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y'
          }}
        >
          {children}
        </div>
      </motion.div>
    </>
  );
};
