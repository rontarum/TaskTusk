# Requirements Document

## Introduction

This document specifies requirements for fixing critical mobile UI issues in the TaskTusk task planner application. The application is a React + TypeScript task prioritization planner with mobile bottom sheet menus. The desktop version functions correctly and must remain unchanged. These fixes target four specific mobile interaction problems that degrade user experience on mobile browsers (Safari, Chrome mobile).

## Glossary

- **Bottom_Sheet**: A modal UI component that slides up from the bottom of the screen, used for mobile forms and menus
- **Card_Settings_Sheet**: The bottom sheet that opens when editing a task card on mobile, containing task name input and sliders
- **Keyboard_Overlay**: The visual artifact where the virtual keyboard covers UI elements, revealing the page content behind the bottom sheet
- **Slider**: A touch-interactive control for adjusting numeric values (priority, desire, difficulty)
- **Handle**: The draggable bar (brow) at the top of a bottom sheet used for dismissing the sheet
- **Page_Scroll**: The vertical scrolling of the main page content
- **Browser_Bottom_Panel**: The browser's native UI controls at the bottom of the mobile viewport
- **Visual_Viewport**: The portion of the page currently visible to the user, which changes when the keyboard appears

## Requirements

### Requirement 1: Keyboard Overlay Prevention

**User Story:** As a mobile user, I want the keyboard to temporarily cover UI elements without causing visual artifacts, so that I can edit task names without seeing the page content behind the bottom sheet.

#### Acceptance Criteria

1. WHEN the virtual keyboard appears in the Card_Settings_Sheet, THE System SHALL maintain the bottom sheet's visual integrity without revealing page content behind it
2. WHEN the virtual keyboard covers UI elements in the Card_Settings_Sheet, THE System SHALL prevent sliders from rendering on top of the keyboard overlay
3. WHEN the user types in the task name input field, THE System SHALL keep the bottom sheet's background opaque and continuous
4. WHEN the keyboard dismisses, THE System SHALL restore the original bottom sheet layout without layout shifts

### Requirement 2: Sufficient Scroll Range

**User Story:** As a mobile user, I want to scroll down far enough to access all controls, so that I can reach the Save button without it being covered by the browser's bottom panel.

#### Acceptance Criteria

1. WHEN the Card_Settings_Sheet is open, THE System SHALL provide sufficient scroll range to reveal all interactive elements
2. WHEN the user scrolls to the bottom of the Card_Settings_Sheet, THE System SHALL ensure the Save button is fully visible above the Browser_Bottom_Panel
3. WHEN the keyboard is visible, THE System SHALL adjust the scrollable area to accommodate both the keyboard and the Browser_Bottom_Panel
4. WHEN the bottom sheet content exceeds the Visual_Viewport height, THE System SHALL enable smooth scrolling to all content

### Requirement 3: Scroll Isolation During Slider Interaction

**User Story:** As a mobile user, I want to adjust sliders without triggering page scroll, so that I can precisely set values without the interface moving unexpectedly.

#### Acceptance Criteria

1. WHEN the user drags a Slider, THE System SHALL prevent Page_Scroll from occurring
2. WHEN the user touches a Slider track, THE System SHALL isolate touch events to the slider component only
3. WHEN the user completes a slider adjustment, THE System SHALL restore normal scroll behavior
4. WHILE a Slider is being dragged, THE System SHALL maintain the page's scroll position

### Requirement 4: Controlled Bottom Sheet Dismissal

**User Story:** As a mobile user, I want bottom sheets to close only through intentional actions, so that I don't accidentally dismiss my work with light swipes.

#### Acceptance Criteria

1. WHEN the user drags the Handle downward, THE Bottom_Sheet SHALL close
2. WHEN the user taps outside the Bottom_Sheet, THE Bottom_Sheet SHALL close
3. WHEN the user presses the browser back button, THE Bottom_Sheet SHALL close
4. WHEN the user swipes down anywhere in the Bottom_Sheet content area (not the Handle), THE Bottom_Sheet SHALL NOT close
5. WHEN the user scrolls content within the Bottom_Sheet, THE System SHALL distinguish between scroll gestures and dismiss gestures
6. WHEN the user performs a light swipe down in the Bottom_Sheet content area, THE Bottom_Sheet SHALL remain open

### Requirement 5: Desktop Preservation

**User Story:** As a desktop user, I want the desktop interface to remain unchanged, so that my workflow is not disrupted by mobile-specific fixes.

#### Acceptance Criteria

1. WHEN changes are applied to mobile components, THE System SHALL NOT modify desktop UI behavior
2. WHEN the viewport width indicates a desktop device, THE System SHALL use the existing desktop components and interactions
3. WHEN mobile-specific fixes are implemented, THE System SHALL scope them to mobile device detection or viewport conditions
