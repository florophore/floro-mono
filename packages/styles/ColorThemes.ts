import palette, { ColorPalette, Opacity } from './ColorPalette'

export interface ColorTheme {
  name: string;
  background: ColorPalette[keyof ColorPalette];
  colors: {
    standardText: string;
    standardTextLight: string;
    contrastText: string;
    contrastTextLight: string;
    titleText: string;
    promptText: string;
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
    pageBannerInfo: string;
    unselectedPluginRowBorderColor: string;
    unselectedPluginRow: string;
    selectedPluginRow: string;
    pluginDisplayTitle: string;
    pluginSectionTitle: string;
    blurbBorder: string;
    blurbText: string;
    pluginDisplaySubTitle: string;
    evenBackground: string;
    oddBackground: string;
    highlightedRowBorder: string;
    releasedText: string;
    unreleasedText: string;
    releaseTextColor: string;
    toggleColor: string;
    searchHighlightedBackground: string;
    updateAvailableTextColor: string;
    pluginBorderDivider: string;
    suggestedPluginBannerColor: string;
    pluginDisplayNameTitleColor: string;
    pluginSelected: string;
    pluginUnSelected: string;
    pluginTitle: string;
    sourceGraphNodeOutline: string;
    sourceGraphNodeBranchlessOutline: string;
    currentInfoBorder: string;
    addedText: string;
    addedBackground: string;
    removedText: string;
    removedBackground: string;
    conflictText: string;
    conflictBackground: string;
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
    versionControlSideBarShadow: string;
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
    standardTextLight: palette.gray,
    contrastText: palette.mediumGray,
    contrastTextLight: palette.gray,
    titleText: palette.purple,
    promptText: palette.mediumGray,
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
    localRemoteBorderColor: palette.gray,
    localRemoteTextColor: palette.gray,
    localRemoteSelectedTextColor: palette.white,
    localRemoteSelectedBackgroundColor: palette.teal,
    pageBannerInfo: palette.mediumGray,
    unselectedPluginRowBorderColor: palette.white,
    unselectedPluginRow: palette.lightPurple,
    selectedPluginRow: palette.purple,
    pluginDisplayTitle: palette.purple,
    pluginSectionTitle: palette.purple,
    blurbBorder: palette.mediumGray,
    blurbText: palette.mediumGray,
    pluginDisplaySubTitle: palette.mediumGray,
    evenBackground: palette.lightGray,
    oddBackground: palette.lightModeBG,
    highlightedRowBorder: palette.purple,
    releasedText: palette.purple,
    unreleasedText: palette.red,
    releaseTextColor: palette.purple,
    toggleColor: palette.purple,
    searchHighlightedBackground: palette.lightGray,
    updateAvailableTextColor: palette.purple,
    pluginBorderDivider: palette.mediumGray,
    suggestedPluginBannerColor: palette.purple,
    pluginDisplayNameTitleColor: palette.purple,
    pluginSelected: palette.purple,
    pluginUnSelected: palette.lightPurple,
    pluginTitle: palette.purple,
    sourceGraphNodeOutline: palette.mediumGray,
    sourceGraphNodeBranchlessOutline: palette.lightGray,
    currentInfoBorder: palette.purple,
    addedText: palette.teal,
    addedBackground: palette.teal,
    removedText: palette.red,
    removedBackground: palette.red,
    conflictText: palette.lightOrange,
    conflictBackground: palette.lightOrange,
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
    versionControlSideBarShadow: palette.darkGray.substring(0, 7) + Opacity[20],
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
        standardTextLight: palette.gray,
        contrastText: palette.white,
        contrastTextLight: palette.white,
        titleText: palette.lightPurple,
        promptText: palette.white,
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
        modalHeaderBackground: palette.purple,
        modalHeaderTitleColor: palette.lightPurple,
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
        heroHeaderBackgroundColor: palette.purple,
        heroHeaderTextColor: palette.lightPurple,
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
        pageBannerInfo: palette.white,
        unselectedPluginRowBorderColor: palette.white,
        unselectedPluginRow: palette.white,
        selectedPluginRow: palette.lightPurple,
        pluginDisplayTitle: palette.lightPurple,
        pluginSectionTitle: palette.lightPurple,
        blurbBorder: palette.white,
        blurbText: palette.white,
        pluginDisplaySubTitle: palette.white,
        evenBackground: palette.mediumGray,
        oddBackground: palette.darkModeBG,
        highlightedRowBorder: palette.lightPurple,
        releasedText: palette.lightPurple,
        unreleasedText: palette.lightRed,
        releaseTextColor: palette.lightPurple,
        toggleColor: palette.lightPurple,
        searchHighlightedBackground: palette.mediumGray,
        updateAvailableTextColor: palette.lightPurple,
        pluginBorderDivider: palette.white,
        suggestedPluginBannerColor: palette.lightPurple,
        pluginDisplayNameTitleColor: palette.lightPurple,
        pluginSelected: palette.lightPurple,
        pluginUnSelected: palette.white,
        pluginTitle: palette.lightPurple,
        sourceGraphNodeOutline: palette.white,
        sourceGraphNodeBranchlessOutline: palette.gray,
        currentInfoBorder: palette.lightPurple,
        addedText: palette.lightTeal,
        addedBackground: palette.lightTeal,
        removedText: palette.lightRed,
        removedBackground: palette.lightRed,
        conflictText: palette.lightOrange,
        conflictBackground: palette.lightOrange,
    },
    shadows: {
        modalContainer: palette.black.substring(0, 7) + Opacity[70],
        innerDropdown: palette.black.substring(0, 7) + Opacity[70],
        outerDropdown: palette.black.substring(0, 7) + Opacity[50],
        localRemoteSelected: palette.darkGray.substring(0, 7) + Opacity[50],
        versionControlSideBarShadow: palette.black.substring(0, 7) + Opacity[50],
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