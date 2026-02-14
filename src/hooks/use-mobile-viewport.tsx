import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 1024;

// Shared state for mobile viewport detection to avoid multiple resize listeners
let mobileViewportState = false;
const listeners: Set<(isMobile: boolean) => void> = new Set();
let isListenerAttached = false;

const handleResize = () => {
  const newState = window.innerWidth < MOBILE_BREAKPOINT;
  if (newState !== mobileViewportState) {
    mobileViewportState = newState;
    listeners.forEach((listener) => listener(newState));
  }
};

const subscribe = (listener: (isMobile: boolean) => void) => {
  listeners.add(listener);

  if (!isListenerAttached) {
    // Initialize state
    mobileViewportState = window.innerWidth < MOBILE_BREAKPOINT;
    window.addEventListener('resize', handleResize);
    isListenerAttached = true;
  }

  // Immediately call with current state
  listener(mobileViewportState);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && isListenerAttached) {
      window.removeEventListener('resize', handleResize);
      isListenerAttached = false;
    }
  };
};

/**
 * Shared hook for mobile viewport detection.
 * Uses a single resize listener shared across all component instances.
 * Breakpoint: < 1024px is considered mobile/tablet viewport.
 */
export const useMobileViewport = (): boolean => {
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    return subscribe(setIsMobileViewport);
  }, []);

  return isMobileViewport;
};

/**
 * Hook that provides keyboard height tracking for mobile viewports.
 * Uses Visual Viewport API with debouncing for smooth keyboard transitions.
 */
export const useKeyboardHeight = (enabled: boolean = true): number => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const isMobileViewport = useMobileViewport();

  useEffect(() => {
    if (!enabled || !isMobileViewport) {
      setKeyboardHeight(0);
      return;
    }

    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      // Debounce to prevent rapid re-renders during keyboard animation
      if (debounceTimer) clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        const windowHeight = window.innerHeight;
        const viewportHeight = visualViewport.height;
        const keyboardVisible = windowHeight > viewportHeight + 50; // 50px threshold

        if (keyboardVisible) {
          setKeyboardHeight(windowHeight - viewportHeight);
        } else {
          setKeyboardHeight(0);
        }
      }, 16); // ~1 frame at 60fps
    };

    visualViewport.addEventListener('resize', handleResize);
    visualViewport.addEventListener('scroll', handleResize);
    handleResize();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      visualViewport.removeEventListener('resize', handleResize);
      visualViewport.removeEventListener('scroll', handleResize);
    };
  }, [enabled, isMobileViewport]);

  return keyboardHeight;
};
