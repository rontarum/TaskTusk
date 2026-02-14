import { useEffect, useRef } from 'react';
import { useMobileViewport } from '@/hooks/use-mobile-viewport';

export const useMobileOptimizations = () => {
  const isMobile = useMobileViewport();
  const hasAppliedRef = useRef(false);

  useEffect(() => {
    if (!isMobile) {
      // Clean up if switching from mobile to desktop
      if (hasAppliedRef.current) {
        document.documentElement.classList.remove('mobile-optimized');
        hasAppliedRef.current = false;
      }
      return;
    }

    // Batch all DOM changes together to minimize layout thrashing
    requestAnimationFrame(() => {
      // Add mobile-optimized class (handles most optimizations via CSS)
      document.documentElement.classList.add('mobile-optimized');

      // Disable gyroscope tilt on mobile
      const tiltElements = document.querySelectorAll('[data-tilt]');
      tiltElements.forEach(el => {
        el.removeAttribute('data-tilt');
      });

      // Apply will-change via CSS class instead of inline style
      const animatedElements = document.querySelectorAll('.paper, .bottom-sheet');
      animatedElements.forEach(el => {
        el.classList.add('mobile-will-change-transform');
      });

      hasAppliedRef.current = true;
    });

    return () => {
      // Cleanup - batch DOM changes
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('mobile-optimized');

        // Remove will-change class from elements
        const animatedElements = document.querySelectorAll('.mobile-will-change-transform');
        animatedElements.forEach(el => {
          el.classList.remove('mobile-will-change-transform');
        });

        hasAppliedRef.current = false;
      });
    };
  }, [isMobile]);

  return { isMobile };
};
