/**
 * HEX to HSL conversion utility
 * Required for Tailwind CSS opacity modifiers like `bg-primary/50`
 */

/**
 * Converts a HEX color string to HSL values string (without "hsl()" wrapper)
 * @param hex - Color in format "#RRGGBB" or "#RGB"
 * @returns HSL string like "160 80% 53%" for use in CSS variables
 */
export function hexToHsl(hex: string): string {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Expand shorthand (e.g., "abc" -> "aabbcc")
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    let h = 0;
    let s = 0;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    // Convert to CSS HSL format (without hsl() wrapper for Tailwind)
    const hDeg = Math.round(h * 360);
    const sPercent = Math.round(s * 100);
    const lPercent = Math.round(l * 100);

    return `${hDeg} ${sPercent}% ${lPercent}%`;
}

/**
 * Generates CSS variable declarations from a theme colors object
 */
export function generateCssVariables(
    colors: Record<string, string>,
    prefix = ''
): string {
    return Object.entries(colors)
        .map(([key, value]) => {
            const varName = prefix ? `--${prefix}-${key}` : `--${key}`;
            const hslValue = hexToHsl(value);
            return `${varName}: ${hslValue};`;
        })
        .join('\n    ');
}
