import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { PlannerItem } from '@/components/planner/types';
import { cn } from '@/lib/utils';

interface DesktopTaskCompletionAnimationProps {
  item: PlannerItem;
  isVisible: boolean;
  onComplete: () => void;
  className?: string;
}

export const DesktopTaskCompletionAnimation = ({
  item,
  isVisible,
  onComplete,
  className,
}: DesktopTaskCompletionAnimationProps) => {
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    if (isVisible) {
      // Trigger haptic feedback on mount (if available)
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
      }, 1200); // Wait for all animations to complete
      return () => clearTimeout(timer);
    }
  }, [isVisible, showContent]);

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {showContent && (
        <motion.div
          className={cn(
            'group flex items-center gap-3 rounded-2xl overflow-hidden relative',
            'bg-background/35 px-3 py-2',
            className
          )}
          initial={{ opacity: 1, transform: 'translateZ(40px)' }}
          animate={{ opacity: 1, transform: 'translateZ(40px)' }}
          exit={{
            opacity: 0,
            transform: 'translateZ(40px)',
            transition: {
              duration: 0.2,
              ease: 'easeOut',
            },
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Fill animation - left to right with gradient edge */}
          <motion.div
            className="absolute inset-0"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            style={{
              background: 'hsl(var(--primary))',
            }}
          >
            {/* Gradient edge for soft effect */}
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.2 }}
              style={{
                background: 'linear-gradient(to left, hsl(var(--primary)), transparent)',
              }}
            />
          </motion.div>

          {/* Content container - fades out as fill happens */}
          <motion.div
            className="relative z-10 flex items-center gap-3 flex-1 min-w-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.2 }}
          >
            {/* Emoji placeholder - same size as original */}
            <span className="text-base flex-shrink-0 w-9 text-center">{item.emoji}</span>
            {/* Text placeholder - same flex behavior as original */}
            <span className="text-sm whitespace-normal break-words flex-1 min-w-0 line-clamp-2">
              {item.text}
            </span>
            {/* Spacer to match delete button width */}
            <div className="w-9 h-9 flex-shrink-0" />
          </motion.div>

          {/* Completion content - appears after fill, same structure */}
          <motion.div
            className="absolute inset-0 flex items-center gap-3 px-3 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {/* Large emoji - same position */}
            <motion.span
              className="text-xl flex-shrink-0 w-9 text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.6,
                type: 'spring',
                stiffness: 400,
                damping: 20,
              }}
            >
              {item.emoji}
            </motion.span>

            {/* Title - large white text, takes remaining space */}
            <motion.h3
              className="font-body font-medium text-lg text-white flex-1 min-w-0 line-clamp-1"
              initial={{ scale: 0.5, opacity: 0, x: -20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              transition={{
                delay: 0.7,
                type: 'spring',
                stiffness: 400,
                damping: 20,
              }}
            >
              {item.text}
            </motion.h3>

            {/* Checkmark - white, same position as delete button */}
            <motion.div
              className="w-9 h-9 flex items-center justify-center flex-shrink-0"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.8,
                type: 'spring',
                stiffness: 400,
                damping: 20,
              }}
            >
              <Check className="w-6 h-6 text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
