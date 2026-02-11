# Design Document: Mobile UI Fixes

## Overview

This design addresses four critical mobile UI issues in the TaskTusk application: keyboard overlay artifacts, insufficient scroll range, page scroll during slider interaction, and overly sensitive bottom sheet dismissal. The solution focuses on improving touch event handling, scroll isolation, and visual viewport management while preserving the existing desktop experience.

The fixes target the following components:
- `BottomSheet.tsx`: Restrict drag-to-dismiss to handle only
- `MobileTaskForm.tsx`: Improve keyboard handling and scroll range
- `TouchSlider.tsx`: Prevent page scroll during interaction
- Mobile-specific CSS adjustments for scroll behavior

## Architecture

### Component Interaction Flow

```
User Touch Event
    ↓
Event Target Detection
    ↓
├─ Handle Area? → Allow drag-to-dismiss
├─ Slider Area? → Isolate to slider, prevent page scroll
├─ Content Area? → Allow scroll, prevent dismiss
└─ Outside Sheet? → Close bottom sheet
```

### Scroll Isolation Strategy

The design uses a layered approach to scroll management:

1. **Bottom Sheet Level**: `overscroll-behavior: contain` prevents scroll chaining
2. **Slider Level**: `touch-action: none` during drag prevents all default touch behaviors
3. **Content Level**: `touch-action: pan-y` allows vertical scroll only
4. **Page Level**: Scroll locked when bottom sheet is open

### Visual Viewport Handling

The Visual Viewport API integration will be enhanced to:
- Track keyboard appearance/dismissal
- Adjust bottom sheet height dynamically
- Maintain proper padding for browser UI
- Prevent layout shifts during keyboard transitions

## Components and Interfaces

### BottomSheet Component Modifications

**Current Issues:**
- Entire sheet is draggable, causing accidental dismissals
- Drag detection doesn't distinguish between scroll and dismiss gestures

**Design Changes:**

```typescript
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  fullScreen?: boolean;
  className?: string;
  dragThreshold?: number;
  velocityThreshold?: number;
  enableHistoryIntegration?: boolean;
  handleOnly?: boolean; // NEW: restrict drag to handle only
}
```

**Drag Detection Logic:**

The sheet will implement two-zone drag handling:
- **Handle Zone**: Small draggable area at the top (48px height)
- **Content Zone**: Scrollable, non-draggable area

Implementation approach:
1. Remove `drag="y"` from the main sheet container
2. Apply `drag="y"` only to the handle element
3. Use `dragPropagation={false}` to prevent drag from bubbling
4. Maintain backdrop click-to-dismiss functionality
5. Preserve browser back button integration

### MobileTaskForm Component Modifications

**Current Issues:**
- Keyboard covers UI and creates visual artifacts
- Insufficient bottom padding for browser UI
- Save button gets hidden behind browser panel

**Design Changes:**

1. **Enhanced Keyboard Handling:**
   - Use `env(safe-area-inset-bottom)` for dynamic padding
   - Add extra padding when keyboard is visible
   - Implement `scrollIntoView` for focused inputs

2. **Improved Scroll Configuration:**
   ```typescript
   // Container styles
   style={{
     height: '100dvh',
     paddingBottom: 'max(env(safe-area-inset-bottom), 80px)',
     overflow: 'auto',
     overscrollBehavior: 'contain'
   }}
   ```

3. **Visual Viewport Integration:**
   - Listen to `visualViewport.resize` events
   - Adjust content padding dynamically
   - Ensure Save button remains accessible

### TouchSlider Component Modifications

**Current Issues:**
- Touch events propagate to parent, causing page scroll
- No touch-action CSS to prevent default behaviors

**Design Changes:**

1. **Event Isolation:**
   ```typescript
   const handleTouchStart = (e: React.TouchEvent) => {
     e.stopPropagation(); // Prevent event bubbling
     handleStart(e.touches[0].clientX);
   };
   
   const handleTouchMove = (e: TouchEvent) => {
     e.preventDefault(); // Prevent default scroll
     if (isDragging && e.touches.length > 0) {
       handleMove(e.touches[0].clientX);
     }
   };
   ```

2. **CSS Touch Action:**
   ```css
   .touch-slider-track {
     touch-action: none; /* Disable all default touch behaviors */
   }
   ```

3. **Passive Event Listeners:**
   - Use `{ passive: false }` for touchmove listeners
   - Allows `preventDefault()` to work correctly

## Data Models

No new data models are required. All changes are behavioral and presentational.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Handle-only drag dismissal

*For any* bottom sheet, dragging the handle downward with sufficient distance or velocity should close the sheet, while dragging anywhere in the content area should not trigger dismissal regardless of gesture strength.

**Validates: Requirements 4.1, 4.4, 4.5, 4.6**

### Property 2: Scroll isolation during slider interaction

*For any* slider drag gesture, the page scroll position at the start of the drag should equal the page scroll position at the end of the drag, and touch events on the slider should not propagate to parent scrollable containers.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 3: Sufficient scroll range for form controls

*For any* bottom sheet form content, the scrollable area should provide enough range such that when scrolled to the maximum position, the Save button's bottom edge is at least 80px above the viewport bottom (accounting for browser UI).

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 4: Desktop behavior preservation

*For any* viewport width greater than or equal to 1024px, the UI should render desktop components and interactions, and mobile-specific fixes should not execute or affect behavior.

**Validates: Requirements 5.1, 5.2**

## Error Handling

### Touch Event Errors

**Scenario:** Browser doesn't support Visual Viewport API

**Handling:** Fallback to `window.innerHeight` and standard resize events (already implemented in BottomSheet)

### Scroll Lock Failures

**Scenario:** Body scroll lock doesn't work on certain iOS versions

**Handling:** Use multiple scroll prevention techniques:
- `overflow: hidden` on body
- `position: fixed` with top offset
- `touchmove` event prevention on backdrop

### Passive Event Listener Warnings

**Scenario:** Browser warns about preventDefault in passive listeners

**Handling:** Explicitly set `{ passive: false }` when adding touchmove listeners that need preventDefault

## Testing Strategy

### Unit Tests

Unit tests will verify specific behaviors and edge cases:

1. **BottomSheet Handle Detection:**
   - Test that drag events on handle trigger dismissal logic
   - Test that drag events on content do not trigger dismissal
   - Test backdrop click closes sheet
   - Test browser back button closes sheet

2. **TouchSlider Event Isolation:**
   - Test that touchstart on slider calls stopPropagation
   - Test that touchmove on slider calls preventDefault
   - Test that slider value updates correctly during drag

3. **MobileTaskForm Keyboard Handling:**
   - Test that visualViewport resize adjusts padding
   - Test that focused input scrolls into view
   - Test that Save button remains accessible after scroll

### Property-Based Tests

Property tests will verify universal behaviors across randomized inputs. Each test should run a minimum of 100 iterations.

**Property Test 1: Handle-only drag dismissal**
- Generate random touch coordinates within bottom sheet bounds
- Generate random drag distances and velocities
- For coordinates in content area: verify sheet remains open regardless of drag strength
- For coordinates in handle area: verify sheet closes when drag exceeds threshold
- **Tag:** Feature: mobile-ui-fixes, Property 1: Handle-only drag dismissal

**Property Test 2: Scroll isolation during slider interaction**
- Generate random initial page scroll positions
- Generate random slider drag gestures (start position, end position)
- Verify page scroll position unchanged after each gesture
- Verify touch events don't propagate to parent containers
- **Tag:** Feature: mobile-ui-fixes, Property 2: Scroll isolation during slider interaction

**Property Test 3: Sufficient scroll range for form controls**
- Generate random form content configurations (varying number of fields)
- For each configuration: scroll to maximum position
- Verify Save button's bottom edge is at least 80px above viewport bottom
- **Tag:** Feature: mobile-ui-fixes, Property 3: Sufficient scroll range for form controls

**Property Test 4: Desktop behavior preservation**
- Generate random viewport widths >= 1024px
- For each width: verify desktop components are rendered
- Verify mobile-specific code paths are not executed
- **Tag:** Feature: mobile-ui-fixes, Property 4: Desktop behavior preservation

### Integration Tests

Integration tests will verify component interactions:

1. **Full Form Workflow:**
   - Open bottom sheet
   - Focus input (keyboard appears)
   - Adjust sliders (no page scroll)
   - Scroll to Save button
   - Submit form
   - Verify sheet closes cleanly

2. **Dismissal Methods:**
   - Test handle drag dismissal
   - Test backdrop click dismissal
   - Test back button dismissal
   - Test that content swipes don't dismiss

### Manual Testing Checklist

Due to the nature of mobile browser quirks, manual testing is essential:

- [ ] Test on iOS Safari (latest)
- [ ] Test on iOS Chrome (latest)
- [ ] Test on Android Chrome (latest)
- [ ] Verify keyboard doesn't create visual artifacts
- [ ] Verify Save button is accessible in all scenarios
- [ ] Verify sliders don't cause page scroll
- [ ] Verify bottom sheet only closes via handle/backdrop/back
- [ ] Verify desktop UI unchanged
- [ ] Test in landscape orientation
- [ ] Test with different keyboard heights

### Testing Configuration

**Property-Based Testing Library:** fast-check (for TypeScript/React)

**Test Runner:** Vitest (already configured in project)

**Minimum Iterations:** 100 per property test

**Test Environment:** jsdom with mobile viewport simulation
