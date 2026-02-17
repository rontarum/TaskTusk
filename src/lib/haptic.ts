/**
 * Haptic feedback utility for mobile devices
 * iOS Safari requires user gesture context for vibration to work
 */

/**
 * Trigger haptic feedback with fallback for unsupported devices
 * @param duration - vibration duration in milliseconds (default: 50ms)
 */
export function triggerHaptic(duration: number = 50): void {
  try {
    // Check if vibration is supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      // iOS requires the call to be in direct response to a user gesture
      // Using window.navigator for better iOS compatibility
      const nav = window.navigator as Navigator & { vibrate?: (pattern: number | number[]) => boolean };
      if (nav.vibrate) {
        nav.vibrate(duration);
      }
    }
  } catch {
    // Silently fail if vibration is not supported or blocked
  }
}

/**
 * Check if haptic feedback is supported on this device
 */
export function isHapticSupported(): boolean {
  if (typeof navigator === 'undefined') return false;
  return 'vibrate' in navigator;
}
