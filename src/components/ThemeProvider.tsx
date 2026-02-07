/**
 * ThemeProvider - Injects theme CSS variables at runtime
 * This ensures colors from theme.config.ts are applied
 */

import { useEffect } from 'react';
import { getLightThemeVars, getDarkThemeVars, getFontFamilies, getRadius } from '@/lib/themeGenerator';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const root = document.documentElement;

        // Apply light theme variables to :root
        const lightVars = getLightThemeVars();
        for (const [key, value] of Object.entries(lightVars)) {
            root.style.setProperty(key, value);
        }

        // Apply font families
        const fonts = getFontFamilies() as any;
        root.style.setProperty('--font-heading', fonts.families.heading);
        root.style.setProperty('--font-body', fonts.families.body);
        root.style.setProperty('--font-numbers', fonts.families.numbers);
        root.style.setProperty('--font-sans', fonts.families.body);
        root.style.setProperty('--font-serif', fonts.families.serif);
        root.style.setProperty('--font-mono', fonts.families.mono);

        // Apply font weights
        root.style.setProperty('--font-weight-heading', fonts.weights.heading);
        root.style.setProperty('--font-weight-body', fonts.weights.body);
        root.style.setProperty('--font-weight-numbers', fonts.weights.numbers);

        // Apply radius
        root.style.setProperty('--radius', getRadius());

        // Apply dark theme variables when .dark class is present
        const observer = new MutationObserver(() => {
            if (root.classList.contains('dark')) {
                const darkVars = getDarkThemeVars();
                for (const [key, value] of Object.entries(darkVars)) {
                    root.style.setProperty(key, value);
                }
            } else {
                const lightVars = getLightThemeVars();
                for (const [key, value] of Object.entries(lightVars)) {
                    root.style.setProperty(key, value);
                }
            }
        });

        observer.observe(root, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return <>{children}</>;
}
