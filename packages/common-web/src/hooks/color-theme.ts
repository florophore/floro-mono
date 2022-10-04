import { useEffect, useState } from 'react';
import { DarkTheme, LightTheme, ColorTheme } from '@floro/styles/ColorThemes';

export const useColorTheme = (): ColorTheme => {
    const [colorTheme, setColorTheme] = useState(LightTheme);

    useEffect(() => {
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

    }, []);
    return colorTheme;
}