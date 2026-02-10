import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TouchSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  label: string;
  onChange: (value: number) => void;
  className?: string;
}

export const TouchSlider = ({
  min,
  max,
  step,
  value,
  label,
  onChange,
  className,
}: TouchSliderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const trackRef = useRef<HTMLDivElement>(null);
  const lastVibrateRef = useRef<number>(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const calculateValue = (clientX: number): number => {
    if (!trackRef.current) return value;

    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    
    return Math.max(min, Math.min(max, steppedValue));
  };

  const handleMove = (clientX: number) => {
    const newValue = calculateValue(clientX);
    setDisplayValue(newValue);

    // Haptic feedback on step change
    if (newValue !== lastVibrateRef.current && 'vibrate' in navigator) {
      navigator.vibrate(10);
      lastVibrateRef.current = newValue;
    }
  };

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    handleMove(clientX);
  };

  const handleEnd = () => {
    setIsDragging(false);
    onChange(displayValue);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, displayValue]);

  const percentage = ((displayValue - min) / (max - min)) * 100;

  return (
    <div className={cn('relative w-full', className)}>
      {/* Label */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-numbers text-muted-foreground">{displayValue}</span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-12 flex items-center cursor-pointer"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Background track */}
        <div className="absolute inset-x-0 h-2 bg-muted rounded-full" />

        {/* Active track */}
        <div
          className="absolute left-0 h-2 bg-primary rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />

        {/* Thumb */}
        <motion.div
          className="absolute w-6 h-6 -ml-3 bg-primary rounded-full shadow-lg flex items-center justify-center"
          style={{ left: `${percentage}%` }}
          animate={{
            scale: isDragging ? 1.3 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Value display during drag */}
          {isDragging && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: -32 }}
              className="absolute bg-foreground text-background px-2 py-1 rounded-lg text-xs font-numbers font-semibold"
            >
              {displayValue}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
