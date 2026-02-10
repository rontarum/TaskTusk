import { useState, useEffect, useMemo } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export type DeviceOrientation = 'portrait' | 'landscape';

export interface DeviceCapabilities {
  touch: boolean;
  gyroscope: boolean;
  gpu: boolean;
  webShare: boolean;
  reducedMotion: boolean;
}

export interface DeviceInfo {
  type: DeviceType;
  orientation: DeviceOrientation;
  capabilities: DeviceCapabilities;
  width: number;
  height: number;
}

// Breakpoints: mobile <640px, tablet 640-1023px, desktop ≥1024px
const getDeviceType = (width: number): DeviceType => {
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

const getOrientation = (width: number, height: number): DeviceOrientation => {
  return width > height ? 'landscape' : 'portrait';
};

const detectCapabilities = (): DeviceCapabilities => {
  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const gyroscope = 'DeviceOrientationEvent' in window;
  const gpu = (() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  })();
  const webShare = 'share' in navigator;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return { touch, gyroscope, gpu, webShare, reducedMotion };
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export const useDevice = (): DeviceInfo => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const capabilities = useMemo(() => detectCapabilities(), []);

  useEffect(() => {
    const handleResize = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      
      debounceTimer = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, []);

  const deviceInfo = useMemo<DeviceInfo>(() => {
    const { width, height } = dimensions;
    return {
      type: getDeviceType(width),
      orientation: getOrientation(width, height),
      capabilities,
      width,
      height,
    };
  }, [dimensions, capabilities]);

  return deviceInfo;
};
