import palette, { ColorPalette, Opacity } from './ColorPalette'

export interface ColorTheme {
  name: string;
  background: ColorPalette[keyof ColorPalette];
  colors: {
    standardText: string;
    contrastText: string;
    disableOverlay: string;
    checkboxBorder: string;
    checkboxFill: string;
    googleButtonBackground: string;
    googleButtonText: string;
    googleButtonBorder: string;
    modalBackdropHidden: string;
    modalBackdropShown: string;
    modalHeaderBackground: string;
    modalHeaderTitleColor: string;
    modalHeaderSubtitleColor: string;
    inputBorderColor: string;
    inputLabelTextColor: string;
    inputPlaceholderTextColor: string;
    inputEntryTextColor: string;
    inputInvalidBorderColor: string;
    inputInvalidLabelTextColor: string;
    instructionTextColor: string;
    warningTextColor: string;
    tooltipInnerShadowColor: string;
    tooltipOuterShadowColor: string;
    signupTooltipUsernameTitle: string;
    signupTooltipUsernameInstruction: string;
    signupTooltipUsernameEmphasizedSymbols: string;
    signupTooltipUsernameErrorText: string;
    signupTooltipUsernameValidText: string;
    heroHeaderBackgroundColor: string;
    heroHeaderTextColor: string;
  };
  shadows: {
    modalContainer: string
  },
  loaders: {
    googleButtonLoader: keyof ColorPalette; 
  }
}

export const LightTheme: ColorTheme = {
  name: "light",
  background: palette.lightModeBG,
  colors: {
    standardText: palette.mediumGray,
    contrastText: palette.mediumGray,
    disableOverlay: palette.white,
    checkboxBorder: palette.gray,
    checkboxFill: palette.white,
    googleButtonBackground: palette.white,
    googleButtonText: palette.darkGray,
    googleButtonBorder: palette.white,
    modalBackdropHidden: palette.gray.substring(0, 7) + Opacity[0],
    modalBackdropShown: palette.gray.substring(0, 7) + Opacity[50],
    modalHeaderTitleColor: palette.purple,
    modalHeaderSubtitleColor: palette.white,
    modalHeaderBackground: palette.lightPurple,
    inputBorderColor: palette.gray,
    inputLabelTextColor: palette.gray,
    inputPlaceholderTextColor: palette.lightGray,
    inputEntryTextColor: palette.mediumGray,
    inputInvalidBorderColor: palette.red,
    inputInvalidLabelTextColor: palette.red,
    instructionTextColor: palette.gray,
    warningTextColor: palette.red,
    tooltipInnerShadowColor: palette.gray,
    tooltipOuterShadowColor: palette.mediumGray.substring(0, 7) + Opacity[30],
    signupTooltipUsernameTitle: palette.gray,
    signupTooltipUsernameInstruction: palette.gray,
    signupTooltipUsernameEmphasizedSymbols: palette.purple,
    signupTooltipUsernameErrorText: palette.red,
    signupTooltipUsernameValidText: palette.purple,
    heroHeaderBackgroundColor: palette.lightPurple,
    heroHeaderTextColor: palette.white
  },
  shadows: {
    modalContainer: palette.mediumGray.substring(0, 7) + Opacity[70],
  },
  loaders: {
    googleButtonLoader: "gray",
  },
}; 

export const DarkTheme: ColorTheme = {
    name: 'dark',
    background: palette.darkModeBG,
    colors: {
        standardText: palette.gray,
        contrastText: palette.white,
        disableOverlay: palette.gray,
        checkboxBorder: palette.mediumGray,
        checkboxFill: palette.gray,
        googleButtonBackground: palette.darkGray,
        googleButtonText: palette.white,
        googleButtonBorder: palette.black,
        modalBackdropHidden: palette.mediumGray.substring(0, 7) + Opacity[0],
        modalBackdropShown: palette.mediumGray.substring(0, 7) + Opacity[50],
        modalHeaderBackground: palette.darkPurple,
        modalHeaderTitleColor: palette.purple,
        modalHeaderSubtitleColor: palette.white,
        inputBorderColor: palette.white,
        inputLabelTextColor: palette.white,
        inputPlaceholderTextColor: palette.mediumGray,
        inputEntryTextColor: palette.white,
        inputInvalidBorderColor: palette.lightRed,
        inputInvalidLabelTextColor: palette.lightRed,
        instructionTextColor: palette.white,
        warningTextColor: palette.lightRed,
        tooltipInnerShadowColor: palette.black,
        tooltipOuterShadowColor: palette.black,
        signupTooltipUsernameTitle: palette.white,
        signupTooltipUsernameInstruction: palette.white,
        signupTooltipUsernameEmphasizedSymbols: palette.purple,
        signupTooltipUsernameErrorText: palette.lightRed,
        signupTooltipUsernameValidText: palette.purple,
        heroHeaderBackgroundColor: palette.darkPurple,
        heroHeaderTextColor: palette.purple
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