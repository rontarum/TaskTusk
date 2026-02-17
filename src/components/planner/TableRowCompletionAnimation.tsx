import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlannerItem } from '@/components/planner/types';
import { cn } from '@/lib/utils';

interface TableRowCompletionAnimationProps {
  item: PlannerItem;
  isVisible: boolean;
  onComplete: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const TableRowCompletionAnimation = ({
  item,
  isVisible,
  onComplete,
  children,
  className,
}: TableRowCompletionAnimationProps) => {
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    if (isVisible) {
      setShowContent(true);
    }
  }, [isVisible]);

  // Handle exit animation completion
  const handleExitComplete = () => {
    onComplete();
  };

  // Handle shaft animation completion - trigger exit after delay
  useEffect(() => {
    if (isVisible && showContent) {
      const timer = setTimeout(() => {
        setShowContent(false);
      }, 1500); // Wait for shaft animation + fade out
      return () => clearTimeout(timer);
    }
  }, [isVisible, showContent]);

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {showContent && (
        <motion.div
          className={cn('relative overflow-hidden', className)}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 0.95,
            transition: {
              duration: 0.3,
              ease: 'easeOut',
            },
          }}
        >
          {/* Original row content */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            {children}
          </motion.div>

          {/* Mint shaft effect - sweeps left to right across the entire row */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{
              x: '200%',
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              x: {
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.2,
              },
              opacity: {
                duration: 0.8,
                times: [0, 0.1, 0.8, 1],
                delay: 0.2,
              }
            }}
            style={{
              background: 'linear-gradient(to right, transparent 0%, hsl(var(--primary) / 0.6) 30%, hsl(var(--primary) / 0.8) 50%, hsl(var(--primary) / 0.6) 70%, transparent 100%)',
              width: '50%',
            }}
          />

          {/* Secondary subtle glow that follows */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{
              x: '200%',
              opacity: [0, 0.5, 0.5, 0]
            }}
            transition={{
              x: {
                duration: 1,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.3,
              },
              opacity: {
                duration: 1,
                times: [0, 0.1, 0.8, 1],
                delay: 0.3,
              }
            }}
            style={{
              background: 'linear-gradient(to right, transparent 0%, hsl(var(--primary) / 0.3) 40%, hsl(var(--primary) / 0.4) 50%, hsl(var(--primary) / 0.3) 60%, transparent 100%)',
              width: '70%',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
