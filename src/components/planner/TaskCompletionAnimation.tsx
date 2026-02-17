import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { PlannerItem } from '@/components/planner/types';
import { cn } from '@/lib/utils';

interface TaskCompletionAnimationProps {
  item: PlannerItem;
  isVisible: boolean;
  onComplete: () => void;
  className?: string;
}

export const TaskCompletionAnimation = ({
  item,
  isVisible,
  onComplete,
  className,
}: TaskCompletionAnimationProps) => {
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    if (isVisible) {
      // Trigger haptic feedback on mount (iPhone vibration)
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      setShowContent(true);
    }
  }, [isVisible]);

  // Handle exit animation completion
  const handleExitComplete = () => {
    onComplete();
  };

  // Handle fill animation completion - trigger exit after delay
  useEffect(() => {
    if (isVisible && showContent) {
      const timer = setTimeout(() => {
        setShowContent(false);
      }, 1000); // Reduced from 1200ms for faster completion
      return () => clearTimeout(timer);
    }
  }, [isVisible, showContent]);

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {showContent && (
        <motion.div
          className={cn(
            'paper p-4 overflow-hidden relative border-transparent',
            className
          )}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 0.95,
            transition: {
              duration: 0.15,
              ease: 'easeOut',
            },
          }}
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Fill animation - left to right with CSS transition for better performance */}
          <motion.div
            className="absolute inset-0"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            style={{
              background: 'hsl(var(--primary))',
              transformOrigin: 'left',
              willChange: 'transform',
            }}
          />

          {/* Content container - fades out as fill happens */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.15 }}
          >
            {/* Original content hidden - emoji + text */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                <h3 className="font-heading font-bold text-xl line-clamp-2 break-words">
                  {item.text}
                </h3>
              </div>
            </div>
            <div className="h-6" /> {/* Spacer for progress bar */}
          </motion.div>

          {/* Completion content - appears after fill */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.2 }}
          >
            <div className="flex items-center gap-3">
              {/* Large emoji - simplified animation */}
              <motion.span
                className="text-3xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.45,
                  duration: 0.2,
                  ease: 'easeOut',
                }}
              >
                {item.emoji}
              </motion.span>

              {/* Title - large white text */}
              <motion.h3
                className="font-heading font-bold text-2xl text-white max-w-[180px] line-clamp-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.5,
                  duration: 0.2,
                  ease: 'easeOut',
                }}
              >
                {item.text}
              </motion.h3>

              {/* Checkmark - white, no circle */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.55,
                  duration: 0.2,
                  ease: 'easeOut',
                }}
              >
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
