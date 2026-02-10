# Implementation Plan: Mobile-Responsive Design

## Overview

This implementation plan transforms TaskTusk from a desktop-optimized application into a fully responsive, mobile-first experience. The approach follows progressive enhancement: build for mobile constraints first, then enhance for larger screens and advanced capabilities. Implementation is organized into logical phases that build incrementally, with each phase delivering testable functionality.

## Tasks

- [x] 1. Set up responsive infrastructure and device detection
  - [x] 1.1 Create enhanced device detection hook (`src/hooks/use-device.tsx`)
    - Implement `useDevice()` hook that returns device type (mobile/tablet/desktop), capabilities (touch, gyroscope, GPU, webShare, reducedMotion), and orientation
    - Use existing breakpoints: mobile <640px, tablet 640-1023px, desktop ≥1024px
    - Detect capabilities: touch via `'ontouchstart' in window`, gyroscope via `'DeviceOrientationEvent' in window`, reducedMotion via media query
    - Memoize results to prevent unnecessary re-renders
    - Add resize listener with debouncing (100ms)
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 12.1, 12.2_
  
  - [x] 1.2 Create mobile settings hook (`src/hooks/use-mobile-settings.tsx`)
    - Implement `useMobileSettings()` hook for managing mobile-specific preferences
    - Settings: enhancedEffects (default: false), compactMode (default: false), gyroscopeTilt (default: true if supported), autoHideHeader (default: true)
    - Persist to localStorage under key `decision-planner:mobile-settings:v1`
    - Provide setter function for updating individual settings
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.6, 13.7_
  
  - [x] 1.3 Create scroll direction detection hook (`src/hooks/use-scroll-direction.tsx`)
    - Implement `useScrollDirection()` hook that returns 'up' | 'down' | 'none'
    - Track scroll position and calculate direction
    - Debounce scroll events to 100ms for performance
    - Return 'none' when scroll position is at top
    - _Requirements: 6.7, 6.8_

- [x] 2. Implement core mobile UI components
  - [x] 2.1 Create BottomSheet component (`src/components/ui/BottomSheet.tsx`)
    - Implement slide-up modal with backdrop (50% opacity)
    - Add drag handle at top for pull-to-dismiss gesture
    - Support fullScreen prop for full-height sheets
    - Close on backdrop tap or swipe down (velocity threshold: 0.5px/ms)
    - Use Framer Motion for spring animations
    - Trap focus within sheet when open, restore focus on close
    - Prevent body scroll when open (use `overflow: hidden` on body)
    - Handle iOS keyboard appearance (adjust viewport with `visualViewport` API)
    - _Requirements: 3.4, 3.5, 7.1, 7.7_
  
  - [x] 2.2 Create TouchSlider component (`src/components/ui/TouchSlider.tsx`)
    - Implement touch-friendly slider with 48px height touch target
    - Display current value above thumb during drag
    - Snap to step values with visual feedback
    - Add haptic feedback on step changes (use `navigator.vibrate(10)` if available)
    - Use Framer Motion for smooth thumb animations
    - Support min, max, step, label, and onChange props
    - _Requirements: 3.1, 3.6, 7.3_
  
  - [x] 2.3 Create MobileMenu component (`src/components/MobileMenu.tsx`)
    - Implement slide-in drawer from right side (300px width)
    - Add backdrop with 40% opacity
    - Close on backdrop click or swipe right gesture
    - List all actions: Открой (import), Сохрани (export), Очисти (clear), Настройки (settings)
    - Include icons for each action using existing icon system
    - Add settings section at bottom with mobile-specific toggles
    - Use Framer Motion for slide animation
    - _Requirements: 6.3, 6.4, 13.1, 13.2, 13.3_

- [x] 3. Build responsive header and navigation
  - [x] 3.1 Create ResponsiveHeader component (`src/components/ResponsiveHeader.tsx`)
    - Implement responsive header with three variants:
      - Desktop (≥1024px): Current layout, 64px height, full tagline
      - Tablet (640-1023px): Abbreviated button labels, 60px height, full tagline
      - Mobile (<640px): Compact layout, 56px height, hidden tagline, hamburger menu
    - Keep ThemeToggle and DonateButton visible in all views
    - Add hamburger menu button for mobile (only visible <640px)
    - Use Framer Motion for smooth height transitions
    - _Requirements: 6.1, 6.2, 6.3, 6.6_
  
  - [x] 3.2 Implement auto-hide header behavior for mobile
    - Use `useScrollDirection()` hook to detect scroll direction
    - Hide header after 2 seconds of downward scrolling inactivity
    - Show header immediately on upward scroll
    - Use Framer Motion for smooth slide animations
    - Only apply auto-hide when `autoHideHeader` setting is enabled
    - Disable auto-hide when BottomSheet is open
    - _Requirements: 6.7, 6.8, 13.4_
  
  - [x] 3.3 Update App.tsx to use ResponsiveHeader
    - Replace current header with ResponsiveHeader component
    - Pass device type from `useDevice()` hook
    - Wire up menu toggle handler for MobileMenu
    - Maintain existing theme and donate button functionality
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 4. Implement mobile task card layout
  - [x] 4.1 Create TaskCard component (`src/components/planner/TaskCard.tsx`)
    - Implement card layout with header (emoji, name, score), progress bar, and visual indicators
    - Display score prominently in top-right corner with large font (32px)
    - Show compact visual indicators: stars for priority, hearts for desire, lightning for difficulty
    - Support expanded state showing detailed metrics (ВАЖНО, ХОЧУ, СЛОЖНО, ПРОЦЕНТ)
    - Use `.paper` class for card surface styling
    - Ensure minimum 44×44px touch targets for all interactive elements
    - Add tap handler to toggle expanded state
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7, 3.1_
  
  - [x] 4.2 Add swipe gesture support to TaskCard
    - Implement swipe left gesture to reveal delete action (red background, trash icon)
    - Implement swipe right gesture to reveal edit action (blue background, pencil icon)
    - Use Framer Motion drag constraints (clamp to ±120px)
    - Implement spring physics for swipe release
    - Show action button when swipe distance > 60px
    - Execute action when swipe distance > 100px with velocity > 0.5px/ms
    - Add visual feedback during swipe (card follows finger, action button fades in)
    - _Requirements: 3.2, 3.3, 3.8_
  
  - [x] 4.3 Add long-press gesture support to TaskCard
    - Implement long-press detection (500ms threshold)
    - Show context menu with actions: Редактировать, Удалить, Дублировать
    - Position context menu near touch point
    - Close context menu on outside tap or action selection
    - Add haptic feedback on long-press trigger (use `navigator.vibrate(50)`)
    - _Requirements: 3.7_
  
  - [x] 4.4 Implement card reordering animation
    - Use Framer Motion layout animations for smooth reordering
    - Animate position changes when sort order changes
    - Use spring physics for natural movement
    - Maintain card identity during reordering (use stable keys)
    - _Requirements: 2.6_

- [-] 5. Create mobile task input form
  - [x] 5.1 Create MobileTaskForm component (`src/components/planner/MobileTaskForm.tsx`)
    - Implement full-screen form in BottomSheet
    - Large text input for task name (auto-focus on mount)
    - Emoji picker button (opens full-screen emoji picker)
    - TouchSlider components for priority (1-10), desire (0-10), difficulty (1-10)
    - Segmented control for percent (0%, 25%, 50%, 75%, 100%)
    - Large "Сохранить" button at bottom (48px height, full width)
    - Real-time validation with inline error messages
    - Support both 'add' and 'edit' modes
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_
  
  - [x] 5.2 Handle keyboard visibility and viewport adjustment
    - Detect keyboard appearance using `visualViewport` API
    - Adjust BottomSheet height to keep input field visible
    - Scroll to focused input when keyboard appears
    - Prevent form submission on Enter key (mobile keyboards)
    - _Requirements: 7.5_
  
  - [ ] 5.3 Create floating action button (FAB) for mobile task input
    - Add FAB in bottom-right corner (mobile view only)
    - Large circular button (56×56px) with plus icon
    - Position with fixed positioning, 16px from bottom and right
    - Add elevation shadow and scale animation on tap
    - Open MobileTaskForm in BottomSheet on tap
    - _Requirements: 7.1, 8.3_

- [x] 6. Build responsive scoring display
  - [x] 6.1 Create ResponsiveScoringTable component (`src/components/planner/ResponsiveScoringTable.tsx`)
    - Implement three layout variants based on device type:
      - Desktop (≥1024px): Use existing PlannerScoringTable
      - Tablet (640-1023px): Simplified 4-column table (Emoji+Name+Progress | Priority+Desire | Difficulty+Percent | Score)
      - Mobile (<640px): Single-column TaskCard grid
    - Pass through all props to appropriate variant
    - Handle layout transitions smoothly (300ms)
    - _Requirements: 2.1, 2.5, 8.1, 8.2_
  
  - [x] 6.2 Update Index.tsx to use ResponsiveScoringTable
    - Replace PlannerScoringTable with ResponsiveScoringTable
    - Pass device type from `useDevice()` hook
    - Wire up card interaction handlers (tap, swipe, long-press)
    - Maintain existing update and editing change handlers
    - _Requirements: 2.1, 2.5, 8.1, 8.2_

- [ ] 7. Implement responsive grid layout
  - [ ] 7.1 Update Index.tsx layout for responsive behavior
    - Mobile (<640px): Stack vertically (FAB + TaskCard grid)
    - Tablet (640-1023px): Two-column layout with 1:1.5 ratio (list:scoring)
    - Desktop (≥1024px): Current two-column layout
    - Use CSS Grid with auto-fit for responsive columns
    - Place task input at top in mobile view for easy access
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 7.2 Handle orientation changes
    - Detect orientation changes using `window.matchMedia('(orientation: portrait)')`
    - Reflow layout within 300ms of orientation change
    - Mobile landscape: Switch to compact two-column layout
    - Update layout on orientation change event
    - _Requirements: 8.6, 8.7_

- [-] 8. Optimize motion effects for mobile
  - [x] 8.1 Update BackgroundGradientAnimation for mobile
    - Add `complexity` prop: 'full' | 'reduced' | 'minimal'
    - Full (desktop): Current implementation (5 gradients + interactive)
    - Reduced (tablet): 3 gradients, no interactive element
    - Minimal (mobile): 2 gradients, static (no animation)
    - Automatically select complexity based on device type and capabilities
    - Disable all animations when `reducedMotion` is true
    - Pause animations when page is hidden (use Page Visibility API)
    - _Requirements: 4.2, 4.3, 4.7, 10.5_
  
  - [ ] 8.2 Conditionally render ParallaxLogo and ParallaxFlower
    - Only render ParallaxLogo and ParallaxFlower on desktop (≥1024px)
    - Hide completely on mobile and tablet for performance
    - Check `enhancedEffects` setting: if enabled on mobile, render with reduced complexity
    - Disable when `reducedMotion` is true
    - _Requirements: 4.1, 10.3_
  
  - [ ] 8.3 Implement reduced motion support
    - Detect `prefers-reduced-motion` media query
    - Disable all Motion_Effects when reduced motion is preferred
    - Use instant transitions instead of animations
    - Maintain functional interactions without visual effects
    - Provide manual toggle in mobile settings to override preference
    - Keep subtle focus indicators for accessibility
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6, 10.7_

- [ ] 9. Add gyroscope tilt effects for mobile
  - [ ] 9.1 Create useGyroscopeTilt hook (`src/hooks/use-gyroscope-tilt.tsx`)
    - Request DeviceOrientation permission on iOS (call `DeviceOrientationEvent.requestPermission()`)
    - Listen to `deviceorientation` events
    - Normalize beta/gamma values to ±5 degree range for rotateX/rotateY
    - Throttle updates to 60fps using requestAnimationFrame
    - Apply exponential moving average smoothing (alpha = 0.2)
    - Return { rotateX, rotateY, rotateZ } values
    - _Requirements: 5.1, 5.2, 5.6_
  
  - [ ] 9.2 Apply gyroscope tilt to TaskCard
    - Use `useGyroscopeTilt()` hook when device supports gyroscope
    - Apply 3D rotation using CSS transforms (rotateX, rotateY)
    - Only enable when `gyroscopeTilt` setting is true
    - Temporarily lock tilt for 300ms after card tap
    - Fallback to static shadow effects when gyroscope unavailable
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7_

- [-] 10. Implement responsive typography and spacing
  - [x] 10.1 Update root font size for responsive scaling
    - Mobile (<640px): 16px base font size (100% scale)
    - Tablet (640-1023px): 18px base font size (112.5% scale)
    - Desktop (≥1024px): 20px base font size (125% scale, existing)
    - Use media queries in `src/index.css` to set `:root` font-size
    - Use fluid typography with `clamp()` for smooth scaling between breakpoints
    - _Requirements: 14.1, 14.2, 14.3, 14.6_
  
  - [ ] 10.2 Update typography styles for mobile readability
    - Maintain minimum 1.5 line height for body text in all views
    - Truncate task names with ellipsis after 2 lines in mobile view
    - Use `tabular-nums` font feature for consistent number alignment
    - Ensure all text meets WCAG AA contrast requirements
    - _Requirements: 14.4, 14.5, 14.7_
  
  - [ ] 10.3 Implement compact mode spacing
    - When `compactMode` setting is enabled, reduce card padding by 30%
    - Reduce vertical spacing between cards by 25%
    - Reduce header height by 8px in mobile view
    - Apply via CSS class `.compact-mode` on root element
    - _Requirements: 13.2, 13.5_

- [ ] 11. Add touch-friendly file operations
  - [ ] 11.1 Implement Web Share API for file export
    - Detect Web Share API support (`'share' in navigator`)
    - When available, use `navigator.share()` with file attachment
    - Include share options for common apps (messaging, email, cloud storage)
    - Fallback to standard download link when Web Share unavailable
    - Show loading indicator during file preparation
    - _Requirements: 9.2, 9.3, 9.7_
  
  - [ ] 11.2 Enhance file import for mobile
    - Trigger native file picker on "Открой" button tap
    - Show loading indicator during file parsing
    - Display user-friendly error messages in BottomSheet on import failure
    - Support drag-and-drop on devices with pointer support
    - Validate file format before parsing (.tsk or .json)
    - _Requirements: 9.1, 9.4, 9.5, 9.6_

- [ ] 12. Implement performance monitoring
  - [ ] 12.1 Create PerformanceMonitor component (`src/components/dev/PerformanceMonitor.tsx`)
    - Display FPS counter in top-right corner
    - Show frame time graph (last 60 frames)
    - Display memory usage if `performance.memory` available
    - Show warning indicator when FPS < 50
    - Use requestAnimationFrame for FPS calculation
    - Sample every 10 frames to reduce overhead
    - Only render in development mode (check `import.meta.env.DEV`)
    - _Requirements: 11.1, 11.2, 11.3, 11.6_
  
  - [ ] 12.2 Add performance logging and warnings
    - Log frame times to console in development mode
    - Log warning when frame time exceeds 16.67ms (60fps budget)
    - Track and report average frame time over 10-second windows
    - Log memory usage warnings when heap exceeds 50MB on mobile
    - Measure and log initial paint time in mobile view
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.7_
  
  - [ ] 12.3 Implement automatic performance adaptation
    - Monitor frame times continuously
    - When average frame time exceeds 20ms for 5 seconds, reduce animation complexity
    - Automatically disable parallax effects if performance degrades
    - Reduce BackgroundGradientAnimation complexity by one level
    - Log performance adaptation actions to console
    - _Requirements: 4.4_

- [ ] 13. Add PWA and offline support
  - [ ] 13.1 Create service worker for offline functionality
    - Set up Workbox for service worker generation
    - Cache application shell (HTML, CSS, JS)
    - Cache static assets (fonts, images)
    - Implement cache-first strategy for static assets
    - Implement network-first strategy for API calls (future-proofing)
    - _Requirements: 15.1, 15.2, 15.6_
  
  - [ ] 13.2 Configure PWA manifest
    - Create `manifest.json` with app metadata
    - Set display mode to `standalone`
    - Define app icons for various sizes (192×192, 512×512)
    - Set theme color and background color
    - Configure start URL and scope
    - _Requirements: 15.5_
  
  - [ ] 13.3 Implement "Add to Home Screen" prompt
    - Listen for `beforeinstallprompt` event
    - Show custom install prompt on mobile browsers
    - Store prompt event for later use
    - Trigger prompt on user action (button click)
    - Track installation analytics (optional)
    - _Requirements: 15.4_
  
  - [ ] 13.4 Ensure offline data persistence
    - Verify localStorage continues to work offline
    - Test task creation, editing, and deletion offline
    - Ensure all CRUD operations work without network
    - Add online/offline status indicator in header
    - _Requirements: 15.3_

- [ ] 14. Implement progressive enhancement and capability detection
  - [ ] 14.1 Create capability detection utilities
    - Detect GPU acceleration support (check for `transform3d` support)
    - Detect touch support (`'ontouchstart' in window`)
    - Detect gyroscope support (`'DeviceOrientationEvent' in window`)
    - Detect Web Share API support (`'share' in navigator`)
    - Store capability flags in context or global state
    - _Requirements: 12.1, 12.5_
  
  - [ ] 14.2 Implement graceful degradation for missing capabilities
    - When GPU acceleration unavailable, use CSS transitions instead of transforms
    - When touch unavailable, provide mouse-based interactions
    - When gyroscope unavailable, use static shadow effects
    - When Web Share unavailable, use standard download
    - Provide fallback static styles for all animated components
    - _Requirements: 12.2, 12.3, 12.4, 12.6, 12.7_

- [-] 15. Add mobile settings panel
  - [x] 15.1 Create MobileSettingsPanel component (`src/components/MobileSettingsPanel.tsx`)
    - Display in BottomSheet when "Настройки" is selected from menu
    - Show toggle switches for: Enhanced Effects, Compact Mode, Gyroscope Tilt, Auto-hide Header
    - Display current device capabilities (read-only info)
    - Add "Reset to Defaults" button at bottom
    - Show warning when enabling Enhanced Effects on low-end devices
    - _Requirements: 13.1, 13.2, 13.3, 13.7_
  
  - [ ] 15.2 Wire up settings to application behavior
    - Connect Enhanced Effects toggle to motion effect rendering
    - Connect Compact Mode toggle to spacing CSS classes
    - Connect Gyroscope Tilt toggle to tilt effect activation
    - Connect Auto-hide Header toggle to header behavior
    - Persist all settings changes to localStorage immediately
    - _Requirements: 13.4, 13.5, 13.6_

- [ ] 16. Final integration and polish
  - [ ] 16.1 Update App.tsx with all responsive components
    - Integrate ResponsiveHeader, MobileMenu, PerformanceMonitor
    - Add device detection and capability detection
    - Apply responsive background animation complexity
    - Conditionally render parallax effects based on device type
    - Wire up all mobile settings to component behavior
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2_
  
  - [ ] 16.2 Add visual feedback for all touch interactions
    - Implement ripple effect or scale animation for button taps
    - Ensure feedback appears within 100ms of touch
    - Use Framer Motion for consistent animation timing
    - Apply to all interactive elements (buttons, cards, menu items)
    - _Requirements: 3.8_
  
  - [ ] 16.3 Test responsive layout transitions
    - Verify smooth transitions when resizing viewport across breakpoints
    - Ensure layout updates within 300ms of resize
    - Test orientation changes on mobile devices
    - Verify no layout shift or content jump during transitions
    - _Requirements: 1.4, 8.6_
  
  - [ ] 16.4 Verify touch target sizes
    - Audit all interactive elements for minimum 44×44px touch targets
    - Increase touch target size where needed (use padding or min-width/height)
    - Test on actual mobile devices with finger interaction
    - Ensure adequate spacing between adjacent touch targets (minimum 8px)
    - _Requirements: 3.1_

- [ ] 17. Checkpoint - Ensure all functionality works across device types
  - Test on actual devices: iPhone (iOS Safari), Android (Chrome), iPad (Safari), Desktop (Chrome/Firefox)
  - Verify all features work in mobile, tablet, and desktop views
  - Test touch gestures (tap, swipe, long-press) on touch devices
  - Test mouse interactions on desktop
  - Verify performance meets 60fps target on mid-range mobile devices
  - Test offline functionality (disable network, verify app works)
  - Test PWA installation and standalone mode
  - Verify reduced motion preference is respected
  - Test gyroscope tilt on devices with gyroscope support
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks are organized in logical phases that build incrementally
- Each task references specific requirements for traceability
- Mobile-first approach: build for constraints, enhance for capabilities
- Performance is critical: maintain 60fps on mid-range mobile devices
- All touch interactions must have visual feedback within 100ms
- Graceful degradation ensures functionality on all devices
- Progressive enhancement provides richer experience on capable devices
- Accessibility is maintained: reduced motion support, focus indicators, semantic HTML
- Testing on actual devices is essential for validating touch interactions and performance
