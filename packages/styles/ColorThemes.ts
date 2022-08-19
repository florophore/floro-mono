import palette, { ColorPalette, Opacity } from './ColorPalette'

export interface ColorTheme {
    name: string;
    background: ColorPalette[keyof ColorPalette],
    colors: {
        disableOverlay: string;
    }
}

export const LightTheme: ColorTheme = {
    name: 'light',
    background: palette.lightModeBG,
    colors: {
        disableOverlay: palette.white,
    }
} 

export const DarkTheme: ColorTheme = {
    name: 'dark',
    background: palette.darkModeBG,
    colors: {
        disableOverlay: palette.gray,
    }
} 

export const ColorThemes: ColorTheme[] = [
    LightTheme,
    DarkTheme
] 