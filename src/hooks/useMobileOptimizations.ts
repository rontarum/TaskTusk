import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export const useMobileOptimizations = () => {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (!isMobile) return;
    
    // Add mobile-optimized class
    document.documentElement.classList.add('mobile-optimized');
    
    // Disable gyroscope tilt on mobile
    const tiltElements = document.querySelectorAll('[data-tilt]');
    tiltElements.forEach(el => {
      el.removeAttribute('data-tilt');
    });
    
    // Add will-change hints for animated elements
    const animatedElements = document.querySelectorAll('.paper, .bottom-sheet');
    animatedElements.forEach(el => {
      (el as HTMLElement).style.willChange = 'transform';
    });
    
    return () => {
      // Cleanup
      document.documentElement.classList.remove('mobile-optimized');
      
      // Remove will-change to conserve memory
      animatedElements.forEach(el => {
        (el as HTMLElement).style.willChange = 'auto';
      });
    };
  }, [isMobile]);
  
  return { isMobile };
};
