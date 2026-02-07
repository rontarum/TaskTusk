/**
 * Converts HEX color to "R, G, B" string format
 */
export function hexToRgb(hex: string): string {
    // Remove # if present
    hex = hex.replace("#", "");

    // Handle shorthands like #FFF
    if (hex.length === 3) {
        hex = hex.split("").map((c) => c + c).join("");
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
}
