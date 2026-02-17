import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMobileViewport } from '@/hooks/use-mobile-viewport';
import { triggerHaptic } from '@/lib/haptic';

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
  const isMobileViewport = useMobileViewport();
  const trackRef = useRef<HTMLDivElement>(null);
  const lastVibrateRef = useRef<number>(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const calculateValue = useCallback((clientX: number): number => {
    if (!trackRef.current) return value;

    const rect = trackRef.current.getBoundingClientRect();
    const padding = 12; // px-3 = 12px padding on each side
    const effectiveWidth = rect.width - padding * 2;
    const offsetX = clientX - rect.left - padding;
    const percentage = Math.max(0, Math.min(1, offsetX / effectiveWidth));
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;

    return Math.max(min, Math.min(max, steppedValue));
  }, [trackRef, value, min, max, step]);

  // Use refs for values needed in event handlers to avoid stale closures
  const isDraggingRef = useRef(isDragging);
  const displayValueRef = useRef(displayValue);
  const isMobileViewportRef = useRef(isMobileViewport);

  // Keep refs in sync
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    displayValueRef.current = displayValue;
  }, [displayValue]);

  useEffect(() => {
    isMobileViewportRef.current = isMobileViewport;
  }, [isMobileViewport]);

  const handleMove = useCallback((clientX: number) => {
    const newValue = calculateValue(clientX);
    setDisplayValue(newValue);

    // Haptic feedback on step change
    if (newValue !== lastVibrateRef.current) {
      triggerHaptic(10);
      lastVibrateRef.current = newValue;
    }
  }, [calculateValue]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    onChange(displayValueRef.current);
  }, [onChange]);

  const handleStart = useCallback((clientX: number) => {
    setIsDragging(true);
    handleMove(clientX);
  }, [handleMove]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleStart(e.clientX);
  }, [handleStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingRef.current) {
      handleMove(e.clientX);
    }
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      handleEnd();
    }
  }, [handleEnd]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only apply mobile-specific event isolation on mobile viewports
    if (isMobileViewportRef.current) {
      e.stopPropagation(); // Prevent event bubbling to parent containers
    }
    handleStart(e.touches[0].clientX);
  }, [handleStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Only prevent default scroll on mobile viewports
    if (isMobileViewportRef.current) {
      e.preventDefault(); // Prevent default scroll behavior
    }
    if (isDraggingRef.current && e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  const handleTouchEnd = useCallback(() => {
    if (isDraggingRef.current) {
      handleEnd();
    }
  }, [handleEnd]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Only use passive: false on mobile viewports where we need preventDefault
      document.addEventListener('touchmove', handleTouchMove, { passive: !isMobileViewportRef.current });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

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
        className="relative h-12 flex items-center cursor-pointer px-3 touch-slider-track"
        style={{ touchAction: isMobileViewport ? 'none' : 'auto' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Background track */}
        <div className="absolute inset-x-3 h-2 bg-muted rounded-full" />

        {/* Active track - width scales with percentage within padded area */}
        <motion.div
          className="absolute left-3 h-2 bg-primary rounded-full"
          animate={{ width: `calc((100% - 24px) * ${percentage / 100})` }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.5 }}
        />

        {/* Thumb - positioned within padded area */}
        <motion.div
          className="absolute w-6 h-6 bg-primary rounded-full shadow-lg flex items-center justify-center"
          style={{ marginLeft: '-12px' }}
          animate={{
            left: `calc(12px + (100% - 24px) * ${percentage / 100})`,
            scale: isDragging ? 1.3 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.5 }}
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
