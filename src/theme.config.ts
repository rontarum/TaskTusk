/**
 * ============================================
 * THEME CONFIGURATION
 * ============================================
 *
 * Edit colors using HEX format (#RRGGBB or #RGB)
 * The system automatically converts to HSL for Tailwind compatibility.
 *
 * After editing, save the file - changes apply on next build/reload.
 */

export const theme = {
    /**
     * COLORS
     * Define your color palette here using HEX values
     */
    colors: {
        light: {
            // Core colors
            primary: "#2DD4BF",           // Main accent (mint/aqua)
            primaryForeground: "#FFFFFF", // Text on primary

            background: "#EDEDED",        // Page background
            foreground: "#425d81ff",        // Main text

            // Card & surfaces
            card: "#F5F5F5",
            cardForeground: "#5C6A7E",

            popover: "#F5F5F5",
            popoverForeground: "#0A1628",

            // Secondary colors
            secondary: "#E3F0F7",
            secondaryForeground: "#0A0A0F",

            muted: "#E0E8F5",
            mutedForeground: "#758BA8",

            accent: "#E6F4F4",
            accentForeground: "#1A2138",

            // Destructive (delete, errors)
            destructive: "#FF4D94",
            destructiveForeground: "#FFF0F5",

            // Borders & inputs
            border: "#F6F6F6",
            input: "#F6F6F6",
            ring: "#2DD4BF",
            buttonOutline: "#FFFFFF",

            // Shadows
            shadow: "#1d94e4ff", // Base color for shadows

            // Sidebar
            sidebarBackground: "#FAFAFA",
            sidebarForeground: "#3D4148",
            sidebarPrimary: "#18181B",
            sidebarPrimaryForeground: "#FAFAFA",
            sidebarAccent: "#F4F4F5",
            sidebarAccentForeground: "#18181B",
            sidebarBorder: "#E5E7EB",
            sidebarRing: "#3B82F6",
        },

        dark: {
            // Core colors
            primary: "#2DD4BF",
            primaryForeground: "#1E1E1E",

            background: "#1E1E1E",
            foreground: "#F0F8FF",

            // Card & surfaces
            card: "#1E1E1E",
            cardForeground: "#F0F8FF",

            popover: "#1E1E1E",
            popoverForeground: "#F0F8FF",

            // Secondary colors
            secondary: "#2A3A4D",
            secondaryForeground: "#F0F8FF",

            muted: "#2A3A4D",
            mutedForeground: "#9CA3AF",

            accent: "#2A3A4D",
            accentForeground: "#F0F8FF",

            // Destructive
            destructive: "#FF4D94",
            destructiveForeground: "#FFF0F5",

            // Borders & inputs
            border: "#444444ff",
            input: "#444444ff",
            ring: "#CBD5E1",
            buttonOutline: "#444444ff",

            // Shadows
            shadow: "#020817", // Base color for shadows

            // Sidebar
            sidebarBackground: "#18181B",
            sidebarForeground: "#F4F4F5",
            sidebarPrimary: "#2563EB",
            sidebarPrimaryForeground: "#FFFFFF",
            sidebarAccent: "#27272A",
            sidebarAccentForeground: "#F4F4F5",
            sidebarBorder: "#27272A",
            sidebarRing: "#3B82F6",
        },
    },

    /**
     * FONTS
     * Define font families and sizes
     */
    fonts: {
        families: {
            heading: "Gropled, ui-sans-serif, system-ui, sans-serif",
            body: "Montserrat, ui-sans-serif, system-ui, sans-serif",
            numbers: "Neutral Face, ui-sans-serif, system-ui, sans-serif",
            sans: "Geist, ui-sans-serif, system-ui, sans-serif",
            serif: "Merriweather, ui-serif, Georgia, serif",
            mono: '"Geist Mono", ui-monospace, SFMono-Regular, monospace',
        },
        weights: {
            heading: "600",
            body: "500",
            numbers: "500",
        },
        sizes: {
            xs: "0.75rem",    // 12px
            sm: "0.875rem",   // 14px
            base: "1rem",     // 16px
            lg: "1.125rem",   // 18px
            xl: "1.25rem",    // 20px
            "2xl": "1.5rem",  // 24px
        },
    },

    /**
     * BORDER RADIUS
     */
    radius: "3rem",

    /**
     * MESH GRADIENTS (Background Animation)
     * Define colors for the animated background
     */
    meshGradients: {
        light: {
            backgroundStart: "#EDEDED",
            backgroundEnd: "#F5F5F5",
            first: "#93f1e5ff", /* Это первый цвет градиента, основа */
            second: "#E3F0F7",
            third: "#E6F4F4",
            fourth: "#ffa6c9ff", /* Это второй цвет градиента, основа */
            fifth: "#E5EAF2",
            pointer: "#EDEDED",
        },
        dark: {
            backgroundStart: "#1E1E1E",
            backgroundEnd: "#1E1E1E",
            first: "#1daf9cff", /* Это первый цвет градиента, основа */
            second: "#18413bff",
            third: "#57283bff",
            fourth: "#962150ff", /* Это второй цвет градиента, основа */
            fifth: "#18181B",
            pointer: "#1E1E1E",
        },
    },
};

export type ThemeColors = typeof theme.colors.light;
export type ThemeFonts = typeof theme.fonts;
