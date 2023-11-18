import { useEffect, useState } from 'react';
import { DarkTheme, LightTheme, ColorTheme } from '@floro/styles/ColorThemes';
import { ThemeSet } from '@floro/common-generators/floro_modules/theme-generator';

export const useSelectedTheme = (themeName: "dark"| "light"): ColorTheme => {
    return themeName == 'light' ? LightTheme : DarkTheme;
}

export const useSystemColorTheme = (initTheme: keyof ThemeSet): ColorTheme => {
    const [colorTheme, setColorTheme] = useState(initTheme == 'dark' ? DarkTheme : LightTheme);

    useEffect(() => {
        if (initTheme) {
            return;
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setColorTheme(DarkTheme);
        } else {
            setColorTheme(LightTheme);
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            const colorScheme = event.matches ? "dark" : "light";
            if (colorScheme == 'dark') {
            setColorTheme(DarkTheme);
            } else {
            setColorTheme(LightTheme);
            }
        });

    }, [initTheme]);
    return colorTheme;
}