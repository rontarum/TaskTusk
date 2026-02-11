# Implementation Plan: Mobile UI Fixes

## Overview

This implementation plan addresses four critical mobile UI issues in TaskTusk: keyboard overlay artifacts, insufficient scroll range, page scroll during slider interaction, and overly sensitive bottom sheet dismissal. The fixes are scoped to mobile devices only, preserving the existing desktop experience.

## Tasks

- [ ] 1. Fix TouchSlider scroll isolation
  - [x] 1.1 Add touch-action CSS and event isolation to TouchSlider
    - Add `touch-action: none` CSS to slider track element
    - Add `stopPropagation()` to touchstart handler
    - Add `preventDefault()` with `{ passive: false }` to touchmove handler
    - Ensure page scroll position remains unchanged during slider drag
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 1.2 Write property test for scroll isolation during slider interaction
    - **Property 2: Scroll isolation during slider interaction**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
  
  - [ ]* 1.3 Write unit tests for TouchSlider event handling
    - Test stopPropagation is called on touchstart
    - Test preventDefault is called on touchmove
    - Test slider value updates correctly during drag
    - _Requirements: 3.1, 3.2_

- [ ] 2. Restrict BottomSheet drag to handle only
  - [x] 2.1 Modify BottomSheet to enable handle-only dragging
    - Remove `drag="y"` from main sheet container
    - Apply `drag="y"` only to handle element with increased hit area
    - Add `dragPropagation={false}` to handle to prevent bubbling
    - Ensure content area is scrollable but not draggable
    - Preserve backdrop click-to-dismiss functionality
    - Preserve browser back button integration
    - _Requirements: 4.1, 4.4, 4.5, 4.6_
  
  - [ ]* 2.2 Write property test for handle-only drag dismissal
    - **Property 1: Handle-only drag dismissal**
    - **Validates: Requirements 4.1, 4.4, 4.5, 4.6**
  
  - [ ]* 2.3 Write unit tests for BottomSheet dismissal methods
    - Test handle drag triggers dismissal
    - Test content area drag does not trigger dismissal
    - Test backdrop click triggers dismissal
    - Test back button triggers dismissal
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Improve MobileTaskForm scroll range and keyboard handling
  - [x] 4.1 Add dynamic padding and scroll improvements to MobileTaskForm
    - Add `paddingBottom: 'max(env(safe-area-inset-bottom), 80px)'` to form container
    - Ensure container uses `100dvh` height
    - Add `overscrollBehavior: 'contain'` to prevent scroll chaining
    - Improve `scrollIntoView` behavior for focused inputs
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 4.2 Enhance Visual Viewport integration in MobileTaskForm
    - Listen to `visualViewport.resize` events
    - Dynamically adjust content padding when keyboard appears
    - Ensure Save button remains accessible above browser UI
    - _Requirements: 2.2, 2.3_
  
  - [ ]* 4.3 Write property test for sufficient scroll range
    - **Property 3: Sufficient scroll range for form controls**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
  
  - [ ]* 4.4 Write unit tests for MobileTaskForm keyboard handling
    - Test visualViewport resize adjusts padding
    - Test focused input scrolls into view
    - Test Save button accessibility after scroll
    - _Requirements: 2.2, 2.3_

- [ ] 5. Add mobile-specific CSS improvements
  - [x] 5.1 Add touch-action and overscroll-behavior CSS rules
    - Add `.touch-slider-track { touch-action: none; }` for sliders
    - Add `.bottom-sheet-content { touch-action: pan-y; overscroll-behavior: contain; }` for bottom sheet content
    - Ensure rules are scoped to mobile viewports only (max-width: 1023px)
    - _Requirements: 3.1, 3.2, 2.4_

- [ ] 6. Verify desktop preservation
  - [x] 6.1 Add viewport width checks to mobile-specific code
    - Ensure mobile fixes only apply when viewport width < 1024px
    - Verify desktop components remain unchanged
    - Add conditional rendering/behavior based on device detection
    - _Requirements: 5.1, 5.2_
  
  - [ ]* 6.2 Write property test for desktop behavior preservation
    - **Property 4: Desktop behavior preservation**
    - **Validates: Requirements 5.1, 5.2**
  
  - [ ]* 6.3 Write integration tests for desktop UI
    - Test desktop viewport renders desktop components
    - Test mobile-specific code paths don't execute on desktop
    - _Requirements: 5.1, 5.2_

- [ ] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Manual testing on real mobile devices (iOS Safari, Chrome mobile, Android Chrome) is essential due to browser-specific keyboard and touch behavior
- Property tests validate universal correctness across randomized inputs
- Unit tests validate specific examples and edge cases
- Desktop UI must remain completely unchanged - all fixes are mobile-only
