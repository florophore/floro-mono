import palette, { ColorPalette, Opacity } from './ColorPalette'

export interface ColorTheme {
  name: string;
  background: ColorPalette[keyof ColorPalette];
  colors: {
    standardText: string;
    disableOverlay: string;
    googleButtonBackground: string;
    googleButtonText: string;
    googleButtonBorder: string;
    modalBackdropHidden: string;
    modalBackdropShown: string;
    modalHeaderBackground: string;
  };
  shadows: {
    modalContainer: string
  },
  loaders: {
    googleButtonLoader: keyof ColorPalette; 
  }
}

export const LightTheme: ColorTheme = {
    name: 'light',
    background: palette.lightModeBG,
    colors: {
        standardText: palette.mediumGray,
        disableOverlay: palette.white,
        googleButtonBackground: palette.white,
        googleButtonText: palette.darkGray,
        googleButtonBorder: palette.white,
        modalBackdropHidden: palette.gray.substring(0, 7) + Opacity[0],
        modalBackdropShown: palette.gray.substring(0, 7) + Opacity[50],
        modalHeaderBackground: palette.lightPurple,
    },
    shadows: {
        modalContainer: palette.mediumGray.substring(0, 7) + Opacity[70],
    },
    loaders: {
        googleButtonLoader: 'gray',
    }
} 

export const DarkTheme: ColorTheme = {
    name: 'dark',
    background: palette.darkModeBG,
    colors: {
        standardText: palette.gray,
        disableOverlay: palette.gray,
        googleButtonBackground: palette.darkGray,
        googleButtonText: palette.white,
        googleButtonBorder: palette.black,
        modalBackdropHidden: palette.mediumGray.substring(0, 7) + Opacity[0],
        modalBackdropShown: palette.mediumGray.substring(0, 7) + Opacity[50],
        modalHeaderBackground: palette.darkPurple,
    },
    shadows: {
        modalContainer: palette.black.substring(0, 7) + Opacity[70],
    },
    loaders: {
        googleButtonLoader: 'white',
    }
} 

export const ColorThemes: ColorTheme[] = [
    LightTheme,
    DarkTheme
] 