# Design Document: Mobile UI Fixes

## Overview

This design addresses critical mobile UX issues in TaskTusk that affect usability on iOS Safari, Chrome Mobile, and other mobile browsers. The solution focuses on eight key areas: keyboard viewport stability, horizontal scroll prevention, bottom sheet reliability, swipe gesture consistency, animation performance, modal scroll locking, browser history integration, and disabling performance-heavy effects on mobile devices.

The design prioritizes mobile-specific optimizations while preserving desktop functionality. All changes are scoped to devices with screen width < 1024px or detected via user agent.

## Architecture

### Mobile Detection Strategy

The application will use a multi-layered approach to detect mobile devices:

1. **CSS Media Queries**: Primary method for styling and layout (`@media (max-width: 1023px)`)
2. **React Hook**: `useMobile()` hook for component logic (already exists in codebase)
3. **User Agent Detection**: Fallback for specific browser behaviors (iOS Safari quirks)

### Viewport Management

The Visual Viewport API will be used to handle keyboard appearance without layout reflow:

```typescript
// Visual Viewport API integration
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', handleViewportResize);
  window.visualViewport.addEventListener('scroll', handleViewportScroll);
}
```

Key principle: The layout viewport (document dimensions) remains fixed while the visual viewport (visible area) adjusts dynamically.

### Touch Event Architecture

Touch events will be handled with directional locking to distinguish between:
- Horizontal swipes (card actions)
- Vertical scrolls (page navigation)
- Tap gestures (card expansion)
- Long press (context menu)

Decision tree for touch events:
1. Record initial touch position
2. Wait 15px of movement to determine direction
3. Lock to horizontal OR vertical based on dominant axis
4. Prevent competing gestures once locked

## Components and Interfaces

### 1. BottomSheet Component (Enhanced)

**Location**: `src/components/ui/BottomSheet.tsx`

**Current Issues**:
- Drag threshold too high (150px)
- Velocity threshold too high (500px/s)
- No browser history integration
- No scroll lock on body
- Visual Viewport not properly handled

**Enhanced Interface**:

```typescript
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  fullScreen?: boolean;
  className?: string;
  // New props
  dragThreshold?: number;        // Default: 100px
  velocityThreshold?: number;    // Default: 300px/s
  enableHistoryIntegration?: boolean;  // Default: true
}
```

**Key Changes**:

1. **Improved Drag Detection**:
   - Lower threshold: 100px offset OR 300px/s velocity
   - More responsive spring animation: `damping: 30, stiffness: 300`
   - Larger drag handle hit area (48px height for better touch target)

2. **Visual Viewport Integration**:
```typescript
useEffect(() => {
  if (!isOpen || !window.visualViewport) return;
  
  const handleResize = () => {
    if (sheetRef.current) {
      // Use visual viewport height instead of window.innerHeight
      const vh = window.visualViewport.height;
      sheetRef.current.style.height = `${vh}px`;
    }
  };
  
  window.visualViewport.addEventListener('resize', handleResize);
  handleResize();
  
  return () => window.visualViewport.removeEventListener('resize', handleResize);
}, [isOpen]);
```

3. **Scroll Lock**:
```typescript
useEffect(() => {
  if (isOpen) {
    // Store current scroll position
    const scrollY = window.scrollY;
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    return () => {
      // Restore scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }
}, [isOpen]);
```

4. **Browser History Integration**:
```typescript
useEffect(() => {
  if (!isOpen || !enableHistoryIntegration) return;
  
  const historyKey = `bottomsheet-${Date.now()}`;
  
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
    if (window.history.state?.bottomSheet === historyKey) {
      window.history.back();
    }
  };
}, [isOpen, onClose, enableHistoryIntegration]);
```

5. **Backdrop Touch Prevention**:
```typescript
<motion.div
  onClick={onClose}
  className="fixed inset-0 z-40 bg-black"
  style={{ touchAction: 'none' }}  // Prevent touch propagation
/>
```

### 2. TaskCard Component (Enhanced)

**Location**: `src/components/planner/TaskCard.tsx`

**Current Issues**:
- Swipe threshold too high (100px) with velocity requirement (500px/s)
- No directional locking (conflicts with vertical scroll)
- Actions only trigger on fast swipes
- No threshold-based triggering

**Enhanced Swipe Logic**:

```typescript
interface SwipeState {
  isDragging: boolean;
  direction: 'horizontal' | 'vertical' | null;
  startX: number;
  startY: number;
}

const [swipeState, setSwipeState] = useState<SwipeState>({
  isDragging: false,
  direction: null,
  startX: 0,
  startY: 0,
});

const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
  setSwipeState({
    isDragging: true,
    direction: null,
    startX: info.point.x,
    startY: info.point.y,
  });
};

const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
  const deltaX = Math.abs(info.point.x - swipeState.startX);
  const deltaY = Math.abs(info.point.y - swipeState.startY);
  
  // Directional locking after 15px movement
  if (!swipeState.direction && (deltaX > 15 || deltaY > 15)) {
    const direction = deltaX > deltaY ? 'horizontal' : 'vertical';
    setSwipeState(prev => ({ ...prev, direction }));
    
    // If vertical, cancel drag and allow scroll
    if (direction === 'vertical') {
      controls.start({ x: 0 });
      return;
    }
  }
  
  // Only process horizontal swipes
  if (swipeState.direction === 'horizontal') {
    const offset = info.offset.x;
    
    // Show action hint at 30px
    if (offset < -30) {
      setSwipeAction('delete');
    } else if (offset > 30) {
      setSwipeAction('edit');
    } else {
      setSwipeAction(null);
    }
  }
};

const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
  const offset = info.offset.x;
  const cardWidth = event.currentTarget?.getBoundingClientRect().width || 300;
  const threshold = cardWidth * 0.5; // 50% of card width
  
  // Trigger action if past threshold (regardless of velocity)
  if (Math.abs(offset) > threshold) {
    if (offset < 0 && onDelete) {
      onDelete(item.id);
      return;
    } else if (offset > 0 && onEdit) {
      onEdit(item.id);
      return;
    }
  }
  
  // Snap back if not triggered
  controls.start({ x: 0 });
  setSwipeAction(null);
  setSwipeState({ isDragging: false, direction: null, startX: 0, startY: 0 });
};
```

**Framer Motion Configuration**:
```typescript
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.3}
  dragDirectionLock={true}  // Enable built-in direction locking
  dragPropagation={false}   // Prevent drag from bubbling
  onDragStart={handleDragStart}
  onDrag={handleDrag}
  onDragEnd={handleDragEnd}
  animate={controls}
  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
/>
```

### 3. MobileTaskForm Component (Enhanced)

**Location**: `src/components/planner/MobileTaskForm.tsx`

**Current Issues**:
- Input focus causes keyboard to shift layout
- No viewport-aware positioning

**Key Changes**:

1. **Prevent Keyboard Layout Shift**:
```typescript
// Use CSS to prevent layout shift
<div className="p-6 pb-8" style={{ 
  height: '100dvh',  // Dynamic viewport height
  overflow: 'auto',
  overscrollBehavior: 'contain'
}}>
```

2. **Input Focus Management**:
```typescript
const handleInputFocus = () => {
  // Scroll input into view smoothly
  if (inputRef.current && window.visualViewport) {
    const rect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.visualViewport.height;
    
    // If input is below keyboard, scroll it into view
    if (rect.bottom > viewportHeight) {
      inputRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }
};
```

### 4. Global Mobile Styles

**Location**: `src/index.css`

**Horizontal Scroll Prevention**:
```css
@media (max-width: 1023px) {
  html, body {
    overflow-x: hidden;
    overscroll-behavior-x: none;
    width: 100%;
    position: relative;
  }
  
  /* Prevent pull-to-refresh on mobile */
  body {
    overscroll-behavior-y: contain;
  }
}
```

**Viewport Units**:
```css
@media (max-width: 1023px) {
  :root {
    /* Use dynamic viewport units for mobile */
    --vh: 1dvh;
    --vw: 1dvw;
  }
}
```

**Touch Action Optimization**:
```css
@media (max-width: 1023px) {
  /* Disable double-tap zoom */
  * {
    touch-action: manipulation;
  }
  
  /* Allow specific elements to have custom touch behavior */
  .swipeable {
    touch-action: pan-y;  /* Allow vertical scroll only */
  }
  
  .draggable-handle {
    touch-action: none;  /* Full control over touch */
  }
}
```

### 5. Performance Optimization Hook

**Location**: `src/hooks/useMobileOptimizations.ts` (new file)

```typescript
import { useEffect } from 'react';
import { useMobile } from '@/hooks/use-mobile';

export const useMobileOptimizations = () => {
  const isMobile = useMobile();
  
  useEffect(() => {
    if (!isMobile) return;
    
    // Disable parallax effects
    document.documentElement.classList.add('mobile-optimized');
    
    // Disable gyroscope tilt
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
      document.documentElement.classList.remove('mobile-optimized');
      
      // Clean up will-change
      animatedElements.forEach(el => {
        (el as HTMLElement).style.willChange = 'auto';
      });
    };
  }, [isMobile]);
  
  return { isMobile };
};
```

**CSS for Mobile Optimizations**:
```css
@media (max-width: 1023px) {
  .mobile-optimized {
    /* Disable parallax */
    --parallax-enabled: 0;
  }
  
  .mobile-optimized .parallax-layer {
    transform: none !important;
  }
  
  /* GPU acceleration for animations */
  .mobile-optimized .paper,
  .mobile-optimized .bottom-sheet {
    transform: translateZ(0);
    backface-visibility: hidden;
  }
}
```

### 6. Settings Menu Update

**Location**: `src/pages/Index.tsx` (settings section)

**Changes**:
- Hide gyroscope tilt toggle on mobile devices
- Add conditional rendering based on `useMobile()` hook

```typescript
const isMobile = useMobile();

// In settings menu JSX:
{!isMobile && (
  <div className="setting-item">
    <label>Гироскоп тильт</label>
    <Switch checked={gyroEnabled} onCheckedChange={setGyroEnabled} />
  </div>
)}
```

## Data Models

No new data models are required. All changes are UI/UX enhancements that work with existing `PlannerItem` type.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: BottomSheet Drag Threshold Triggering

*For any* BottomSheet component, when dragged with an offset exceeding 100px OR velocity exceeding 300px/s in the downward direction, the onClose callback should be invoked.

**Validates: Requirements 3.1**

### Property 2: TaskCard Swipe Threshold Triggering

*For any* TaskCard with a given width, when swiped beyond 50% of its width in either direction, the corresponding action (edit or delete) should trigger upon release, regardless of swipe velocity or duration.

**Validates: Requirements 4.1, 4.2**

### Property 3: Directional Lock Detection

*For any* touch gesture on a TaskCard, when the cumulative movement exceeds 15px, the direction should be locked to either horizontal or vertical based on which axis has greater displacement, and this lock should prevent gestures in the perpendicular direction.

**Validates: Requirements 4.3, 4.5**

### Property 4: TaskCard Snap Back Behavior

*For any* TaskCard swipe that is released before reaching the 50% threshold, the card should animate back to its original position (x: 0) with a spring animation.

**Validates: Requirements 4.6**

### Property 5: Scroll Position Preservation

*For any* BottomSheet that opens and then closes, the background page scroll position should be restored to its original value before the sheet opened.

**Validates: Requirements 6.3**

### Property 6: Browser History Stack Management

*For any* sequence of BottomSheet open/close operations, the browser history should be managed such that: (1) opening a sheet pushes a state, (2) pressing back closes the most recently opened sheet, (3) programmatic close removes the history state, and (4) the URL never changes.

**Validates: Requirements 7.2, 7.3, 7.4, 7.5**

### Property 7: Will-Change Lifecycle Management

*For any* animated element on mobile, the will-change CSS property should be applied only during active animations and removed upon animation completion to conserve memory.

**Validates: Requirements 5.3, 5.6**

### Property 8: Touch Event Debouncing

*For any* rapid sequence of touch events (> 10 events within 100ms), the event handler should process only a subset of events to prevent performance degradation.

**Validates: Requirements 8.4**

### Property 9: Mobile Device Detection

*For any* device with screen width < 1024px OR mobile user agent string, the mobile optimization flag should be set to true, triggering all mobile-specific behaviors.

**Validates: Requirements 9.5**

### Example Tests

The following behaviors should be verified with specific example tests:

**Example 1: Visual Viewport API Integration**
- Verify that BottomSheet attaches resize event listener to window.visualViewport when opened
- **Validates: Requirements 1.2**

**Example 2: Dynamic Viewport Height Usage**
- Verify that BottomSheet uses dvh or svh CSS units for height on mobile
- **Validates: Requirements 1.5**

**Example 3: Horizontal Scroll Prevention**
- Verify that body and html elements have overflow-x: hidden on mobile devices
- **Validates: Requirements 2.1, 2.2**

**Example 4: Vertical Scroll Preservation**
- Verify that overflow-y is not set to hidden, allowing vertical scrolling
- **Validates: Requirements 2.4**

**Example 5: Backdrop Click Closes Sheet**
- Verify that clicking the backdrop element calls onClose
- **Validates: Requirements 3.2**

**Example 6: Spring Animation Configuration**
- Verify that BottomSheet uses spring animation with damping: 30, stiffness: 300
- **Validates: Requirements 3.4**

**Example 7: Drag Constraints Configuration**
- Verify that BottomSheet drag constraints are properly configured
- **Validates: Requirements 3.5**

**Example 8: Scroll Lock on Open**
- Verify that body has overflow: hidden when BottomSheet is open
- **Validates: Requirements 6.1, 6.2**

**Example 9: Touch Action on Backdrop**
- Verify that backdrop element has touch-action: none style
- **Validates: Requirements 6.4**

**Example 10: Content Area Scrolling**
- Verify that BottomSheet content area allows scrolling while backdrop prevents it
- **Validates: Requirements 6.5**

**Example 11: Overscroll Behavior**
- Verify that overscroll-behavior is set to prevent momentum scroll propagation
- **Validates: Requirements 6.6**

**Example 12: History State Push**
- Verify that history.pushState is called when BottomSheet opens
- **Validates: Requirements 7.1**

**Example 13: GPU-Accelerated Transforms**
- Verify that BottomSheet animations use transform: translateY
- **Validates: Requirements 5.1**

**Example 14: Layout Animation Configuration**
- Verify that TaskCard uses Framer Motion layout prop with spring config
- **Validates: Requirements 5.2**

**Example 15: Compositor Layer Promotion**
- Verify that animated elements have transform: translateZ(0) or transform3d
- **Validates: Requirements 5.5**

**Example 16: Passive Event Listeners**
- Verify that scroll and touch event listeners use { passive: true } option
- **Validates: Requirements 8.2**

**Example 17: RequestAnimationFrame Usage**
- Verify that swipe gesture updates use requestAnimationFrame
- **Validates: Requirements 8.3**

**Example 18: Gyroscope Tilt Disabled**
- Verify that data-tilt attributes are removed on mobile devices
- **Validates: Requirements 9.1**

**Example 19: Parallax Disabled**
- Verify that parallax transforms are set to none on mobile
- **Validates: Requirements 9.2**

**Example 20: Settings Menu Conditional Rendering**
- Verify that gyroscope toggle is not rendered when isMobile is true
- **Validates: Requirements 9.3**

## Error Handling

### Viewport API Fallback

If Visual Viewport API is not available (older browsers):

```typescript
const useViewportHeight = () => {
  const [height, setHeight] = useState(window.innerHeight);
  
  useEffect(() => {
    const updateHeight = () => {
      if (window.visualViewport) {
        setHeight(window.visualViewport.height);
      } else {
        // Fallback to window.innerHeight
        setHeight(window.innerHeight);
      }
    };
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateHeight);
    } else {
      window.addEventListener('resize', updateHeight);
    }
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateHeight);
      } else {
        window.removeEventListener('resize', updateHeight);
      }
    };
  }, []);
  
  return height;
};
```

### History API Fallback

If History API is not available or fails:

```typescript
const useSafeHistory = (isOpen: boolean, onClose: () => void) => {
  useEffect(() => {
    if (!isOpen) return;
    
    try {
      const historyKey = `modal-${Date.now()}`;
      window.history.pushState({ modal: historyKey }, '');
      
      const handlePopState = (e: PopStateEvent) => {
        if (e.state?.modal === historyKey) {
          onClose();
        }
      };
      
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
        try {
          if (window.history.state?.modal === historyKey) {
            window.history.back();
          }
        } catch (err) {
          console.warn('Failed to clean up history state:', err);
        }
      };
    } catch (err) {
      console.warn('History API not available:', err);
      // Fallback: just use onClose without history integration
    }
  }, [isOpen, onClose]);
};
```

### Touch Event Errors

Handle cases where touch events are not supported:

```typescript
const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent) => {
  try {
    const point = 'touches' in event 
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
      : { x: event.clientX, y: event.clientY };
    
    setSwipeState({ startX: point.x, startY: point.y, direction: null });
  } catch (err) {
    console.warn('Failed to process touch event:', err);
    // Fallback to mouse events only
  }
};
```

### Animation Performance Degradation

If animations are causing performance issues, provide escape hatch:

```typescript
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return prefersReducedMotion;
};

// In component:
const reducedMotion = useReducedMotion();
const springConfig = reducedMotion 
  ? { type: 'tween', duration: 0.2 }
  : { type: 'spring', damping: 30, stiffness: 300 };
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific configuration examples (spring animation parameters, CSS values)
- Integration points (Visual Viewport API, History API)
- Edge cases (API not available, touch events not supported)
- Component rendering (conditional rendering of settings toggle)

**Property-Based Tests** focus on:
- Universal behaviors across all inputs (swipe thresholds, directional locking)
- State management (scroll position preservation, history stack management)
- Performance optimizations (will-change lifecycle, event debouncing)

### Property-Based Testing Configuration

**Library**: Use `@fast-check/vitest` for TypeScript/React property-based testing

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `// Feature: mobile-ui-fixes, Property N: [property text]`

**Example Property Test Structure**:

```typescript
import { test } from 'vitest';
import fc from 'fast-check';

// Feature: mobile-ui-fixes, Property 2: TaskCard Swipe Threshold Triggering
test('TaskCard triggers action when swiped beyond 50% threshold', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 200, max: 500 }), // card width
      fc.integer({ min: 0, max: 1000 }),  // swipe velocity
      (cardWidth, velocity) => {
        const threshold = cardWidth * 0.5;
        const swipeDistance = threshold + 10; // Just over threshold
        
        const { result } = renderHook(() => useSwipeLogic(cardWidth));
        
        act(() => {
          result.current.handleDragEnd({
            offset: { x: swipeDistance, y: 0 },
            velocity: { x: velocity, y: 0 }
          });
        });
        
        // Action should trigger regardless of velocity
        expect(result.current.actionTriggered).toBe(true);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Test Examples

```typescript
import { render, screen } from '@testing-library/react';
import { BottomSheet } from '@/components/ui/BottomSheet';

// Example 1: Visual Viewport API Integration
test('BottomSheet attaches visualViewport listener when opened', () => {
  const mockAddEventListener = vi.fn();
  window.visualViewport = {
    addEventListener: mockAddEventListener,
    removeEventListener: vi.fn(),
    height: 800,
  } as any;
  
  const { rerender } = render(
    <BottomSheet isOpen={false} onClose={() => {}}>
      Content
    </BottomSheet>
  );
  
  expect(mockAddEventListener).not.toHaveBeenCalled();
  
  rerender(
    <BottomSheet isOpen={true} onClose={() => {}}>
      Content
    </BottomSheet>
  );
  
  expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
});

// Example 6: Spring Animation Configuration
test('BottomSheet uses correct spring animation parameters', () => {
  const { container } = render(
    <BottomSheet isOpen={true} onClose={() => {}}>
      Content
    </BottomSheet>
  );
  
  const sheet = container.querySelector('[data-testid="bottom-sheet"]');
  const motionProps = sheet?.getAttribute('data-motion-props');
  
  expect(motionProps).toContain('damping: 30');
  expect(motionProps).toContain('stiffness: 300');
});
```

### Integration Testing

Key integration scenarios to test:
1. BottomSheet opening → keyboard appears → input focus → keyboard dismisses → sheet closes
2. TaskCard swipe → action triggers → new sheet opens → back button → sheet closes
3. Multiple sheets opening sequentially → back button closes in LIFO order
4. Page scroll → sheet opens → scroll locked → sheet closes → scroll restored

### Manual Testing Checklist

Due to the nature of mobile interactions, manual testing on real devices is essential:

**iOS Safari**:
- [ ] Keyboard appearance doesn't shift layout
- [ ] Bottom sheet swipe-to-dismiss works smoothly
- [ ] Back button closes sheets
- [ ] No horizontal scroll on page
- [ ] Card swipes work reliably
- [ ] Animations are smooth (60fps)
- [ ] Gyroscope tilt is disabled
- [ ] Parallax is disabled

**Chrome Mobile (Android)**:
- [ ] Same checklist as iOS Safari

**Firefox Mobile**:
- [ ] Same checklist as iOS Safari

### Performance Testing

Use Chrome DevTools Performance profiler to verify:
- No layout thrashing during keyboard appearance
- Animations run at 60fps
- will-change is applied/removed correctly
- No excessive repaints during swipe gestures

## Implementation Notes

### Order of Implementation

1. **Global CSS changes** (horizontal scroll prevention, viewport units)
2. **Mobile detection hook** (useMobileOptimizations)
3. **BottomSheet enhancements** (viewport API, scroll lock, history integration)
4. **TaskCard swipe improvements** (directional locking, threshold-based triggering)
5. **MobileTaskForm keyboard handling**
6. **Settings menu conditional rendering**
7. **Performance optimizations** (will-change, GPU acceleration)

### Browser Compatibility

**Minimum supported versions**:
- iOS Safari 13+ (Visual Viewport API)
- Chrome Mobile 61+
- Firefox Mobile 68+

**Fallbacks required for**:
- Visual Viewport API (use window.innerHeight)
- History API (graceful degradation)
- Touch events (mouse events as fallback)

### Performance Targets

- First interaction: < 16ms (60fps)
- Animation frame rate: 60fps sustained
- Memory usage: < 50MB increase for modal overlays
- Touch response time: < 100ms perceived latency

## References

- [Visual Viewport API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API)
- [Framer Motion - Drag Gestures](https://www.framer.com/motion/gestures/)
- [CSS will-change - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)
- [History API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [Touch Events - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
