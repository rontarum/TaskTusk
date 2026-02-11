# Implementation Plan: Mobile UI Fixes

## Overview

This implementation plan addresses critical mobile UX issues in TaskTusk through systematic enhancements to viewport management, touch gesture handling, scroll behavior, animation performance, and browser integration. The approach prioritizes mobile-specific optimizations while preserving desktop functionality, with all changes scoped to devices with screen width < 1024px.

## Tasks

- [x] 1. Add global mobile CSS optimizations
  - Add horizontal scroll prevention (overflow-x: hidden) to html and body elements for mobile
  - Add dynamic viewport height CSS variables (--vh: 1dvh)
  - Add touch-action: manipulation to prevent double-tap zoom
  - Add overscroll-behavior-y: contain to prevent pull-to-refresh
  - Add GPU acceleration hints (translateZ(0)) for .paper and animated elements
  - Add .mobile-optimized class styles to disable parallax effects
  - _Requirements: 2.1, 2.2, 2.4, 5.5, 9.2_

- [ ] 2. Create mobile optimizations hook
  - [x] 2.1 Create useMobileOptimizations hook in src/hooks/useMobileOptimizations.ts
    - Detect mobile using useMobile() hook
    - Add/remove .mobile-optimized class to document.documentElement
    - Remove data-tilt attributes from all elements on mobile
    - Apply will-change: transform to animated elements
    - Clean up will-change on unmount
    - _Requirements: 9.1, 9.2, 9.5, 5.3, 5.6_
  
  - [ ] 2.2 Write property test for mobile device detection
    - **Property 9: Mobile Device Detection**
    - **Validates: Requirements 9.5**
  
  - [ ] 2.3 Write example tests for mobile optimizations
    - Test gyroscope tilt disabled on mobile
    - Test parallax disabled on mobile
    - _Requirements: 9.1, 9.2_

- [ ] 3. Enhance BottomSheet component with viewport and scroll management
  - [x] 3.1 Add Visual Viewport API integration to BottomSheet
    - Add useEffect to listen to visualViewport resize events
    - Update sheet height dynamically using visualViewport.height
    - Add fallback to window.innerHeight if API not available
    - Use dvh CSS units for height on mobile
    - _Requirements: 1.2, 1.5_
  
  - [x] 3.2 Implement scroll lock when BottomSheet opens
    - Store current scroll position when opening
    - Apply overflow: hidden, position: fixed, and top offset to body
    - Restore scroll position and styles when closing
    - Add touch-action: none to backdrop element
    - Add overscroll-behavior to prevent momentum scroll propagation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6_
  
  - [ ] 3.3 Write property test for scroll position preservation
    - **Property 5: Scroll Position Preservation**
    - **Validates: Requirements 6.3**
  
  - [ ] 3.4 Write example tests for scroll lock
    - Test body has overflow: hidden when sheet is open
    - Test backdrop has touch-action: none
    - Test content area allows scrolling
    - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [ ] 4. Add browser history integration to BottomSheet
  - [x] 4.1 Implement History API integration
    - Push history state with unique key when sheet opens
    - Add popstate event listener to handle back button
    - Call onClose when back button pressed
    - Clean up history state when sheet closes programmatically
    - Add error handling for History API failures
    - Add enableHistoryIntegration prop (default: true)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 4.2 Write property test for browser history management
    - **Property 6: Browser History Stack Management**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5**
  
  - [ ]* 4.3 Write example test for history state push
    - Test history.pushState is called when sheet opens
    - _Requirements: 7.1_

- [ ] 5. Improve BottomSheet drag behavior
  - [x] 5.1 Update drag thresholds and animation config
    - Lower drag threshold to 100px (from 150px)
    - Lower velocity threshold to 300px/s (from 500px/s)
    - Update spring animation to damping: 30, stiffness: 300
    - Increase drag handle hit area to 48px height
    - Update dragElastic to 0.3 for better feel
    - _Requirements: 3.1, 3.4, 3.5_
  
  - [ ]* 5.2 Write property test for drag threshold triggering
    - **Property 1: BottomSheet Drag Threshold Triggering**
    - **Validates: Requirements 3.1**
  
  - [ ]* 5.3 Write example tests for drag configuration
    - Test spring animation parameters
    - Test drag constraints
    - Test backdrop click closes sheet
    - _Requirements: 3.2, 3.4, 3.5_

- [ ] 6. Checkpoint - Ensure BottomSheet tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Enhance TaskCard swipe gesture handling
  - [x] 7.1 Implement directional drag locking
    - Add SwipeState interface with direction, startX, startY
    - Track initial touch position in handleDragStart
    - Detect direction after 15px movement (horizontal vs vertical)
    - Lock to detected direction and prevent perpendicular gestures
    - Cancel drag if direction is vertical (allow page scroll)
    - Add dragDirectionLock={true} and dragPropagation={false} to motion.div
    - _Requirements: 4.3, 4.5_
  
  - [x] 7.2 Implement threshold-based action triggering
    - Calculate threshold as 50% of card width (not fixed 100px)
    - Trigger action when swipe exceeds threshold, regardless of velocity
    - Remove velocity requirement (currently 500px/s)
    - Keep snap-back animation for swipes below threshold
    - Update dragConstraints to { left: 0, right: 0 }
    - Update dragElastic to 0.3
    - _Requirements: 4.1, 4.2, 4.6_
  
  - [ ]* 7.3 Write property test for swipe threshold triggering
    - **Property 2: TaskCard Swipe Threshold Triggering**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ]* 7.4 Write property test for directional lock detection
    - **Property 3: Directional Lock Detection**
    - **Validates: Requirements 4.3, 4.5**
  
  - [ ]* 7.5 Write property test for snap back behavior
    - **Property 4: TaskCard Snap Back Behavior**
    - **Validates: Requirements 4.6**
  
  - [ ]* 7.6 Write example test for scroll propagation prevention
    - Test vertical scroll is prevented when swiping horizontally
    - _Requirements: 4.4_

- [ ] 8. Optimize TaskCard and BottomSheet animations
  - [ ] 8.1 Add GPU acceleration and will-change management
    - Ensure BottomSheet uses transform: translateY for animations
    - Ensure TaskCard uses layout prop with spring config
    - Add transform: translateZ(0) to animated elements
    - Implement will-change lifecycle: add during animation, remove after
    - Add useReducedMotion hook for accessibility
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6_
  
  - [ ]* 8.2 Write property test for will-change lifecycle
    - **Property 7: Will-Change Lifecycle Management**
    - **Validates: Requirements 5.3, 5.6**
  
  - [ ]* 8.3 Write example tests for animation configuration
    - Test BottomSheet uses translateY transforms
    - Test TaskCard uses layout animations
    - Test compositor layer promotion (translateZ)
    - _Requirements: 5.1, 5.2, 5.5_

- [ ] 9. Enhance MobileTaskForm keyboard handling
  - [x] 9.1 Add viewport-aware input focus management
    - Use 100dvh for form container height
    - Add overflow: auto and overscroll-behavior: contain
    - Implement handleInputFocus to scroll input into view when keyboard appears
    - Use visualViewport to detect if input is below keyboard
    - Call scrollIntoView with smooth behavior and center block
    - _Requirements: 1.2, 1.4_
  
  - [ ]* 9.2 Write example test for Visual Viewport API usage
    - Test visualViewport listener is attached
    - Test dvh units are used
    - _Requirements: 1.2, 1.5_

- [ ] 10. Add touch event optimizations
  - [ ] 10.1 Implement passive event listeners and debouncing
    - Add passive: true option to scroll and touch event listeners
    - Use requestAnimationFrame for swipe gesture visual updates
    - Implement debouncing for rapid touch events (> 10 events in 100ms)
    - Add error handling for touch events not supported
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [ ]* 10.2 Write property test for touch event debouncing
    - **Property 8: Touch Event Debouncing**
    - **Validates: Requirements 8.4**
  
  - [ ]* 10.3 Write example tests for touch optimizations
    - Test passive event listeners are used
    - Test requestAnimationFrame is called during swipe
    - _Requirements: 8.2, 8.3_

- [ ] 11. Update settings menu for mobile
  - [x] 11.1 Hide gyroscope tilt toggle on mobile devices
    - Import useMobile hook in Index.tsx
    - Conditionally render gyroscope toggle only when !isMobile
    - Ensure other settings remain visible
    - _Requirements: 9.3_
  
  - [ ]* 11.2 Write example test for conditional rendering
    - Test gyroscope toggle is not rendered when isMobile is true
    - _Requirements: 9.3_

- [ ] 12. Integrate mobile optimizations hook into App
  - [x] 12.1 Add useMobileOptimizations to Index.tsx or App.tsx
    - Call useMobileOptimizations() at top level
    - Ensure hook runs on mount and cleanup on unmount
    - Verify .mobile-optimized class is applied on mobile devices
    - _Requirements: 9.1, 9.2, 9.5_

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples, configurations, and edge cases
- Manual testing on real iOS and Android devices is essential for final validation
- All changes are scoped to mobile devices (screen width < 1024px) to preserve desktop functionality
