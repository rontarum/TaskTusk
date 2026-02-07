/**
 * Generates CSS variable declarations from theme.config.ts
 * This file creates the CSS that applies the theme colors
 */

import { theme } from '../theme.config';
import { hexToHsl } from './hexToHsl';
import { hexToRgb } from './hexToRgb';

type ColorKey = keyof typeof theme.colors.light;

// Map theme config keys to CSS variable names
const colorKeyToCssVar: Record<ColorKey, string> = {
    primary: 'primary',
    primaryForeground: 'primary-foreground',
    background: 'background',
    foreground: 'foreground',
    card: 'card',
    cardForeground: 'card-foreground',
    popover: 'popover',
    popoverForeground: 'popover-foreground',
    secondary: 'secondary',
    secondaryForeground: 'secondary-foreground',
    muted: 'muted',
    mutedForeground: 'muted-foreground',
    accent: 'accent',
    accentForeground: 'accent-foreground',
    destructive: 'destructive',
    destructiveForeground: 'destructive-foreground',
    border: 'border',
    input: 'input',
    ring: 'ring',
    buttonOutline: 'button-outline',
    shadow: 'shadow-color', // Map to --shadow-color to avoid conflict with --shadow (box-shadow)
    sidebarBackground: 'sidebar-background',
    sidebarForeground: 'sidebar-foreground',
    sidebarPrimary: 'sidebar-primary',
    sidebarPrimaryForeground: 'sidebar-primary-foreground',
    sidebarAccent: 'sidebar-accent',
    sidebarAccentForeground: 'sidebar-accent-foreground',
    sidebarBorder: 'sidebar-border',
    sidebarRing: 'sidebar-ring',
};

/**
 * Generates CSS variables for a given theme mode
 */
function generateColorVars(colors: typeof theme.colors.light): Record<string, string> {
    const vars: Record<string, string> = {};

    for (const [key, hex] of Object.entries(colors)) {
        const cssVarName = colorKeyToCssVar[key as ColorKey];
        if (cssVarName) {
            vars[`--${cssVarName}`] = hexToHsl(hex);
        }
    }

    return vars;
}

/**
 * Generates Mesh Gradient variables for a given theme mode
 */
function generateMeshVars(mode: 'light' | 'dark'): Record<string, string> {
    const vars: Record<string, string> = {};
    const mesh = theme.meshGradients[mode];

    vars['--mesh-bg-start'] = hexToRgb(mesh.backgroundStart);
    vars['--mesh-bg-end'] = hexToRgb(mesh.backgroundEnd);
    vars['--mesh-color-1'] = hexToRgb(mesh.first);
    vars['--mesh-color-2'] = hexToRgb(mesh.second);
    vars['--mesh-color-3'] = hexToRgb(mesh.third);
    vars['--mesh-color-4'] = hexToRgb(mesh.fourth);
    vars['--mesh-color-5'] = hexToRgb(mesh.fifth);
    vars['--mesh-pointer-color'] = hexToRgb(mesh.pointer);

    return vars;
}

/**
 * Gets the light theme CSS variables
 */
export function getLightThemeVars(): Record<string, string> {
    return {
        ...generateColorVars(theme.colors.light),
        ...generateMeshVars('light'),
    };
}

/**
 * Gets the dark theme CSS variables
 */
export function getDarkThemeVars(): Record<string, string> {
    return {
        ...generateColorVars(theme.colors.dark),
        ...generateMeshVars('dark'),
    };
}

/**
 * Gets font families from config
 */
export function getFontFamilies() {
    return theme.fonts;
}

/**
 * Gets the radius value from config
 */
export function getRadius() {
    return theme.radius;
}
