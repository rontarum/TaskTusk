# Design Document: Mobile-Responsive Design

## Overview

This design implements comprehensive mobile-responsive functionality for TaskTusk, transforming the desktop-optimized application into a fluid, touch-friendly experience across all device sizes. The implementation follows a progressive enhancement strategy, detecting device capabilities and adapting the UI, interactions, and performance characteristics accordingly.

### Key Design Principles

1. **Mobile-First Mindset**: Design for constraints first, enhance for capabilities
2. **Performance Budget**: Maintain 60fps on mid-range mobile devices (iPhone 12, Samsung Galaxy S21)
3. **Touch-First Interactions**: All interactions must work with touch; mouse is enhancement
4. **Progressive Enhancement**: Detect capabilities, provide fallbacks, enhance when possible
5. **Graceful Degradation**: Every feature must have a functional fallback
6. **Accessibility First**: Motion effects are enhancements, not requirements

### Technical Approach

The design uses a three-tier responsive system:
- **Mobile (<640px)**: Card-based layout, bottom sheets, simplified effects
- **Tablet (640-1023px)**: Hybrid layout, adapted table, moderate effects
- **Desktop (≥1024px)**: Current full-featured experience

### Research Findings

**Touch Target Sizing**: Apple HIG and Material Design both recommend minimum 44×44px touch targets. We'll use 48×48px for primary actions, 44×44px for secondary.

**Performance Considerations**: 
- CSS transforms (translate, scale, rotate) and opacity are GPU-accelerated on all modern mobile browsers
- requestAnimationFrame should be throttled to device refresh rate (typically 60Hz, some devices 120Hz)
- Intersection Observer API is well-supported and efficient for visibility detection
- Passive event listeners improve scroll performance by 30-40% on mobile

**Gyroscope API**: DeviceOrientationEvent is supported on iOS 13+ (with permission) and Android 5+. Requires HTTPS and user permission on iOS.

**Web Share API**: Supported on iOS Safari 12.2+, Chrome Android 61+, Samsung Internet 8.2+. Provides native share sheet.

**Service Workers**: Supported on all modern mobile browsers. Workbox library simplifies implementation.

## Architecture

### Component Hierarchy

```
App
├── BackgroundGradientAnimation (conditional rendering)
├── Header (responsive variant)
│   ├── Logo (responsive sizing)
│   ├── ThemeToggle
│   ├── DonateButton
│   └── MobileMenu (new, <640px only)
├── ParallaxLogo (conditional, ≥1024px)
├── ParallaxFlower (conditional, ≥1024px)
└── Main
    ├── ActionBar (responsive layout)
    │   ├── FileActions (responsive)
    │   └── ViewActions (responsive)
    ├── TaskInput (responsive variant)
    │   ├── Desktop: Inline form
    │   ├── Tablet: Inline form
    │   └── Mobile: FAB → Bottom Sheet
    └── TaskDisplay (responsive variant)
        ├── Desktop: Two-column (list + table)
        ├── Tablet: Two-column (adapted)
        └── Mobile: Single column (cards)
```

### Responsive Strategy

**Breakpoint Detection**:
```typescript
// Enhanced use-mobile hook
const breakpoints = {
  mobile: 640,
  tablet: 1024,
} as const;

type DeviceType = 'mobile' | 'tablet' | 'desktop';

function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  
  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < breakpoints.mobile) setDeviceType('mobile');
      else if (width < breakpoints.tablet) setDeviceType('tablet');
      else setDeviceType('desktop');
    };
    
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);
  
  return deviceType;
}
```

**Capability Detection**:
```typescript
interface DeviceCapabilities {
  touch: boolean;
  gyroscope: boolean;
  gpu: boolean;
  webShare: boolean;
  reducedMotion: boolean;
}

function useDeviceCapabilities(): DeviceCapabilities {
  return useMemo(() => ({
    touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    gyroscope: 'DeviceOrientationEvent' in window,
    gpu: detectGPUAcceleration(),
    webShare: 'share' in navigator,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }), []);
}
```

### State Management

**New State Requirements**:
```typescript
// Mobile-specific settings
interface MobileSettings {
  enhancedEffects: boolean;
  compactMode: boolean;
  gyroscopeTilt: boolean;
  autoHideHeader: boolean;
}

// UI state for mobile interactions
interface MobileUIState {
  activeBottomSheet: 'add' | 'edit' | 'menu' | null;
  editingTaskId: string | null;
  swipedTaskId: string | null;
  headerVisible: boolean;
  menuOpen: boolean;
}
```

## Components and Interfaces

### 1. Enhanced Device Detection Hook

**File**: `src/hooks/use-device.tsx` (new)

```typescript
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  capabilities: DeviceCapabilities;
  orientation: 'portrait' | 'landscape';
}

export function useDevice(): DeviceInfo;
```

**Responsibilities**:
- Detect device type based on viewport width
- Detect device capabilities (touch, gyroscope, GPU, etc.)
- Track orientation changes
- Memoize results to prevent unnecessary re-renders

### 2. Mobile Settings Hook

**File**: `src/hooks/use-mobile-settings.tsx` (new)

```typescript
export function useMobileSettings(): [
  MobileSettings,
  (key: keyof MobileSettings, value: boolean) => void
];
```

**Responsibilities**:
- Manage mobile-specific settings
- Persist to localStorage under key `decision-planner:mobile-settings:v1`
- Provide defaults based on device capabilities

### 3. Responsive Header Component

**File**: `src/components/ResponsiveHeader.tsx` (new)

```typescript
interface ResponsiveHeaderProps {
  deviceType: DeviceType;
  onMenuToggle: () => void;
}

export function ResponsiveHeader(props: ResponsiveHeaderProps): JSX.Element;
```

**Behavior**:
- **Desktop**: Current header layout (64px height)
- **Tablet**: Abbreviated button labels, 60px height
- **Mobile**: Compact layout (56px height), hamburger menu, hidden tagline
- **Mobile with scroll**: Auto-hide after 2s inactivity, show on scroll up

**Implementation Details**:
- Use Framer Motion for smooth show/hide animations
- Track scroll direction with useScrollDirection hook
- Debounce scroll events to 100ms

### 4. Mobile Menu Component

**File**: `src/components/MobileMenu.tsx` (new)

```typescript
interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onAction: (action: 'import' | 'export' | 'clear' | 'settings') => void;
}

export function MobileMenu(props: MobileMenuProps): JSX.Element;
```

**Behavior**:
- Slide-in drawer from right side
- Backdrop with 40% opacity
- Close on backdrop click or swipe right
- List all actions with icons and labels
- Include settings section at bottom

### 5. Task Card Component

**File**: `src/components/planner/TaskCard.tsx` (new)

```typescript
interface TaskCardProps {
  item: PlannerItem;
  onTap: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onLongPress: () => void;
  expanded: boolean;
  gyroscopeEnabled: boolean;
}

export function TaskCard(props: TaskCardProps): JSX.Element;
```

**Layout**:
```
┌─────────────────────────────────┐
│ 🎯 Task Name              [85]  │ ← Header (emoji, name, score)
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ ← Progress bar
│ ⭐⭐⭐⭐⭐ 💖💖💖💖💖 ⚡⚡⚡⚡⚡ │ ← Visual indicators
│ ВАЖНО: 5  ХОЧУ: 5  СЛОЖНО: 5   │ ← Compact metrics (when expanded)
└─────────────────────────────────┘
```

**Interactions**:
- Tap: Toggle expanded state
- Swipe left: Reveal delete button (red background)
- Swipe right: Reveal edit button (blue background)
- Long press: Show context menu
- Gyroscope tilt: Apply 3D rotation based on device orientation

**Implementation Details**:
- Use Framer Motion for swipe gestures and animations
- Use react-use-gesture for touch handling
- Implement spring physics for swipe release
- Clamp swipe distance to ±120px

### 6. Bottom Sheet Component

**File**: `src/components/ui/BottomSheet.tsx` (new)

```typescript
interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  fullScreen?: boolean;
}

export function BottomSheet(props: BottomSheetProps): JSX.Element;
```

**Behavior**:
- Slide up from bottom with spring animation
- Backdrop with 50% opacity
- Drag handle at top for pull-to-dismiss
- Close on backdrop tap or swipe down
- Trap focus within sheet when open
- Prevent body scroll when open

**Implementation Details**:
- Use Framer Motion drag constraints
- Implement velocity-based dismiss threshold
- Use React Portal for rendering outside DOM hierarchy
- Handle keyboard appearance on iOS (adjust viewport)

### 7. Mobile Task Form Component

**File**: `src/components/planner/MobileTaskForm.tsx` (new)

```typescript
interface MobileTaskFormProps {
  mode: 'add' | 'edit';
  initialData?: Partial<PlannerItem>;
  onSubmit: (data: PlannerItem) => void;
  onCancel: () => void;
}

export function MobileTaskForm(props: MobileTaskFormProps): JSX.Element;
```

**Layout**:
- Full-screen bottom sheet
- Large touch-friendly inputs
- Emoji picker button (opens full-screen picker)
- Slider controls for numeric values (priority, desire, difficulty)
- Segmented control for percent (0%, 25%, 50%, 75%, 100%)
- Large "Сохранить" button at bottom

**Implementation Details**:
- Auto-focus task name input on mount
- Real-time validation with inline errors
- Haptic feedback on value changes (if supported)
- Prevent form submission on Enter (mobile keyboards)

### 8. Touch Slider Component

**File**: `src/components/ui/TouchSlider.tsx` (new)

```typescript
interface TouchSliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  label: string;
  onChange: (value: number) => void;
  showValue?: boolean;
}

export function TouchSlider(props: TouchSliderProps): JSX.Element;
```

**Behavior**:
- Large touch target (48px height)
- Visual feedback on drag
- Snap to step values
- Display current value above thumb
- Haptic feedback on step changes (if supported)

### 9. Performance Monitor Component

**File**: `src/components/dev/PerformanceMonitor.tsx` (new)

```typescript
interface PerformanceMonitorProps {
  enabled: boolean;
}

export function PerformanceMonitor(props: PerformanceMonitorProps): JSX.Element;
```

**Display**:
- FPS counter (top-right corner)
- Frame time graph (last 60 frames)
- Memory usage (if available)
- Warning indicator when FPS < 50

**Implementation Details**:
- Use requestAnimationFrame for FPS calculation
- Sample every 10 frames to reduce overhead
- Only render in development mode
- Use performance.memory API when available

### 10. Gyroscope Tilt Hook

**File**: `src/hooks/use-gyroscope-tilt.tsx` (new)

```typescript
interface TiltValues {
  rotateX: number; // -5 to 5 degrees
  rotateY: number; // -5 to 5 degrees
  rotateZ: number; // -5 to 5 degrees
}

export function useGyroscopeTilt(enabled: boolean): TiltValues;
```

**Behavior**:
- Request permission on iOS (DeviceOrientationEvent.requestPermission)
- Listen to deviceorientation events
- Normalize values to ±5 degree range
- Throttle updates to 60fps
- Apply smoothing with exponential moving average

### 11. Optimized Background Animation

**File**: `src/components/ui/background-gradient-animation.tsx` (modified)

**Changes**:
- Add `complexity` prop: 'full' | 'reduced' | 'minimal'
- **Full**: Current implementation (5 gradients + interactive)
- **Reduced**: 3 gradients, no interactive element
- **Minimal**: 2 gradients, static (no animation)
- Automatically select complexity based on device type and capabilities
- Pause animations when page is hidden (Page Visibility API)

### 12. Responsive Scoring Table

**File**: `src/components/planner/ResponsiveScoringTable.tsx` (new)

```typescript
interface ResponsiveScoringTableProps {
  items: PlannerItem[];
  order: string[];
  deviceType: DeviceType;
  onUpdate: (id: string, patch: Partial<PlannerItem>) => void;
  onEditingChange: (editing: boolean) => void;
}

export function ResponsiveScoringTable(props: ResponsiveScoringTableProps): JSX.Element;
```

**Behavior**:
- **Desktop**: Current PlannerScoringTable
- **Tablet**: Simplified table with grouped columns
  - Column 1: Emoji + Name + Progress
  - Column 2: Priority + Desire (combined)
  - Column 3: Difficulty + Percent (combined)
  - Column 4: Score
- **Mobile**: TaskCard grid (single column)

## Data Models

### MobileSettings

```typescript
interface MobileSettings {
  enhancedEffects: boolean;      // Enable full motion effects on mobile
  compactMode: boolean;           // Reduce spacing and padding
  gyroscopeTilt: boolean;         // Enable gyroscope-based tilt
  autoHideHeader: boolean;        // Auto-hide header on scroll
}

// Default values
const defaultMobileSettings: MobileSettings = {
  enhancedEffects: false,         // Off by default for performance
  compactMode: false,             // Normal spacing by default
  gyroscopeTilt: true,            // On if device supports it
  autoHideHeader: true,           // On by default
};
```

### DeviceCapabilities

```typescript
interface DeviceCapabilities {
  touch: boolean;                 // Touch input available
  gyroscope: boolean;             // DeviceOrientation API available
  gpu: boolean;                   // GPU acceleration detected
  webShare: boolean;              // Web Share API available
  reducedMotion: boolean;         // User prefers reduced motion
  standalone: boolean;            // Running as PWA
  online: boolean;                // Network connectivity
}
```

### SwipeState

```typescript
interface SwipeState {
  taskId: string;
  direction: 'left' | 'right';
  distance: number;               // 0-120px
  velocity: number;               // px/ms
  revealed: boolean;              // Action button visible
}
```

### BottomSheetState

```typescript
interface BottomSheetState {
  type: 'add' | 'edit' | 'menu' | 'settings' | null;
  data?: any;                     // Context-specific data
  fullScreen: boolean;
}
```

### PerformanceMetrics

```typescript
interface PerformanceMetrics {
  fps: number;                    // Current frames per second
  frameTime: number;              // Average frame time (ms)
  frameTimes: number[];           // Last 60 frame times
  memoryUsage?: number;           // Heap size in MB (if available)
  warnings: string[];             // Performance warnings
}
```

### ResponsiveLayout

```typescript
type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveLayout {
  deviceType: DeviceType;
  breakpoint: number;             // Current breakpoint value
  orientation: 'portrait' | 'landscape';
  viewportWidth: number;
  viewportHeight: number;
  safeAreaInsets: {               // For notched devices
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}
```

### TouchGesture

```typescript
interface TouchGesture {
  type: 'tap' | 'longPress' | 'swipe' | 'drag';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocity: number;
  duration: number;               // ms since gesture start
  target: HTMLElement;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I've identified the following testable properties. I've eliminated redundancy by:
- Combining similar viewport-based rendering properties (1.1, 1.2, 1.3) into a single comprehensive property
- Merging swipe gesture properties (3.2, 3.3) into one bidirectional property
- Consolidating font size properties (14.1, 14.2, 14.3) into a single responsive typography property
- Combining capability detection and fallback properties (12.2, 12.6, 12.7) into comprehensive prog