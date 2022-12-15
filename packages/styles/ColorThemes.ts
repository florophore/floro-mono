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
    radioFill: string;
    radioSelectFill: string;
    radioBorder: string;
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
    profileInfoNameTextColor: string;
    profileInfoUsernameTextColor: string;
    profileHoverOpacity: string;
    profileHoverDeepOpacity: string;
    followerTextColor: string;
    connectionTextColor: string;
    commonBorder: string;
    titleTextColor: string;
    ownerDescriptorUsernameColor: string;
    slashRepoCreateColor: string;
    privateSelectTextColor: string;
    optionTextColor: string;
    highlightedOptionBackgroundColor: string;
    dropdownDividerColor: string;
    repoSelectSubtitleTextColor: string;
    photoDeleteIconColor: string;
    offlineWarningTabColor: string;
    tosLinkTextColor: string;
    sidebarTitleTextColor: string;
    sidebarTitleBorderColor: string;
    profilePictureBorderColor: string;
    repoBriefRowColor: string;
    repoBriefRowUpdateColor: string;
    pluginIconTextColor: string;
    versionControllerBorderColor: string;
    localRemoteBorderColor: string;
    localRemoteTextColor: string;
    localRemoteSelectedTextColor: string;
    localRemoteSelectedBackgroundColor: string;
  };
  gradients: {
    backgroundNoOpacity: string;
    backgroundFullOpacity: string;
  };
  shadows: {
    modalContainer: string;
    innerDropdown: string;
    outerDropdown: string;
    localRemoteSelected: string;
  };
  loaders: {
    googleButtonLoader: keyof ColorPalette; 
  }
}

export const LightTheme: ColorTheme = {
  name: "light", // this is keyable
  background: palette.lightModeBG, //this is keyable
  colors: {
    standardText: palette.mediumGray, //"$.theme.colors.standardText"
    contrastText: palette.mediumGray,
    disableOverlay: palette.white,
    checkboxBorder: palette.gray,
    checkboxFill: palette.white,
    radioBorder: palette.gray,
    radioFill: palette.white,
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
    heroHeaderTextColor: palette.white,
    profileInfoNameTextColor: palette.purple,
    profileInfoUsernameTextColor: palette.mediumGray,
    profileHoverOpacity: palette.darkGray.substring(0, 7) + Opacity[50],
    profileHoverDeepOpacity: palette.black.substring(0, 7) + Opacity[50],
    followerTextColor: palette.mediumGray,
    connectionTextColor: palette.mediumGray,
    commonBorder: palette.mediumGray,
    titleTextColor: palette.purple,
    ownerDescriptorUsernameColor: palette.purple,
    slashRepoCreateColor: palette.purple,
    privateSelectTextColor: palette.gray,
    optionTextColor: palette.mediumGray,
    highlightedOptionBackgroundColor: palette.lightGray,
    dropdownDividerColor: palette.lightGray,
    repoSelectSubtitleTextColor: palette.gray,
    photoDeleteIconColor: palette.red,
    offlineWarningTabColor: palette.lightRed,
    radioSelectFill: palette.purple,
    tosLinkTextColor: palette.purple,
    sidebarTitleTextColor: palette.purple,
    sidebarTitleBorderColor: palette.purple,
    profilePictureBorderColor: palette.lightGray,
    repoBriefRowColor: palette.mediumGray,
    repoBriefRowUpdateColor: palette.gray,
    pluginIconTextColor: palette.purple,
    versionControllerBorderColor: palette.mediumGray,
    localRemoteBorderColor: palette.mediumGray,
    localRemoteTextColor: palette.gray,
    localRemoteSelectedTextColor: palette.white,
    localRemoteSelectedBackgroundColor: palette.teal,
  },
  gradients: {
    backgroundNoOpacity: palette.lightModeBG.substring(0, 7) + Opacity[0],
    backgroundFullOpacity: palette.lightModeBG.substring(0, 7) + Opacity[100],
  },
  shadows: {
    modalContainer: palette.mediumGray.substring(0, 7) + Opacity[70],
    innerDropdown: palette.mediumGray.substring(0, 7) + Opacity[100],
    outerDropdown: palette.black.substring(0, 7) + Opacity[50],
    localRemoteSelected: palette.darkGray.substring(0, 7) + Opacity[50],
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
        radioBorder: palette.white,
        radioFill: palette.white,
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
        signupTooltipUsernameEmphasizedSymbols: palette.lightPurple,
        signupTooltipUsernameErrorText: palette.lightRed,
        signupTooltipUsernameValidText: palette.lightPurple,
        heroHeaderBackgroundColor: palette.darkPurple,
        heroHeaderTextColor: palette.purple,
        profileInfoNameTextColor: palette.lightPurple,
        profileInfoUsernameTextColor: palette.white,
        profileHoverOpacity: palette.black.substring(0, 7) + Opacity[50],
        profileHoverDeepOpacity: palette.black.substring(0, 7) + Opacity[50],
        followerTextColor: palette.white,
        connectionTextColor: palette.white,
        commonBorder: palette.white,
        titleTextColor: palette.lightPurple,
        ownerDescriptorUsernameColor: palette.lightPurple,
        slashRepoCreateColor: palette.lightPurple,
        privateSelectTextColor: palette.white,
        optionTextColor: palette.white,
        highlightedOptionBackgroundColor: palette.mediumGray,
        dropdownDividerColor: palette.mediumGray,
        repoSelectSubtitleTextColor: palette.gray,
        photoDeleteIconColor: palette.lightRed,
        offlineWarningTabColor: palette.lightRed,
        radioSelectFill: palette.lightPurple,
        tosLinkTextColor: palette.lightPurple,
        sidebarTitleTextColor: palette.lightPurple,
        sidebarTitleBorderColor: palette.lightPurple,
        profilePictureBorderColor: palette.white,
        repoBriefRowColor: palette.white,
        repoBriefRowUpdateColor: palette.gray,
        pluginIconTextColor: palette.lightPurple,
        versionControllerBorderColor: palette.white,
        localRemoteBorderColor: palette.white,
        localRemoteTextColor: palette.white,
        localRemoteSelectedTextColor: palette.white,
        localRemoteSelectedBackgroundColor: palette.teal,
    },
    shadows: {
        modalContainer: palette.black.substring(0, 7) + Opacity[70],
        innerDropdown: palette.black.substring(0, 7) + Opacity[70],
        outerDropdown: palette.black.substring(0, 7) + Opacity[50],
        localRemoteSelected: palette.darkGray.substring(0, 7) + Opacity[50],
    },
    gradients: {
      backgroundNoOpacity: palette.darkModeBG.substring(0, 7) + Opacity[0],
      backgroundFullOpacity: palette.darkModeBG.substring(0, 7) + Opacity[100],
    },
    loaders: {
        googleButtonLoader: 'white',
    }
} 

export const ColorThemes: ColorTheme[] = [
    LightTheme,
    DarkTheme
] 