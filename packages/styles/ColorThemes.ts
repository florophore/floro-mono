import palette, { ColorPalette, Opacity } from './ColorPalette'

export interface ColorTheme {
  name: string;
  background: ColorPalette[keyof ColorPalette];
  colors: {
    disableOverlay: string;
    googleButtonBackground: string;
    googleButtonText: string;
    googleButtonBorder: string;
  };
  loaders: {
    googleButtonLoader: keyof ColorPalette; 
  }
}

export const LightTheme: ColorTheme = {
    name: 'light',
    background: palette.lightModeBG,
    colors: {
        disableOverlay: palette.white,
        googleButtonBackground: palette.white,
        googleButtonText: palette.darkGray,
        googleButtonBorder: palette.white,
    },
    loaders: {
        googleButtonLoader: 'gray',
    }
} 

export const DarkTheme: ColorTheme = {
    name: 'dark',
    background: palette.darkModeBG,
    colors: {
        disableOverlay: palette.gray,
        googleButtonBackground: palette.darkGray,
        googleButtonText: palette.white,
        googleButtonBorder: palette.black,
    },
    loaders: {
        googleButtonLoader: 'white',
    }
} 

export const ColorThemes: ColorTheme[] = [
    LightTheme,
    DarkTheme
] 