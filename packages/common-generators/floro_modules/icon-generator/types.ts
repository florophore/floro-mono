// To parse this data:
//
//   import { Convert, Icons } from "./file";
//
//   const icons = Convert.toIcons(json);

export interface Icons {
    "about.backward":                  AboutBackward;
    "about.cascading-relations":       AboutCascadingRelations;
    "about.diff-keys":                 AboutDiffKeys;
    "about.floro-pipeline":            AboutFloroPipeline;
    "about.forward":                   AboutForward;
    "about.key-syntax":                AboutKeySyntax;
    "about.list-transform":            AboutListTransform;
    "about.overview":                  AboutOverview;
    "about.pause":                     AboutPause;
    "about.play":                      AboutPlay;
    "about.relations-refactor-part-1": AboutRelationsRefactorPart1;
    "about.set-to-types":              AboutSetToTypes;
    "about.set-updates":               AboutSetUpdates;
    "about.spreadsheet":               AboutSpreadsheet;
    "about.spreadsheet-keys":          AboutSpreadsheetKeys;
    "about.state-change":              AboutStateChange;
    "about.treelist-sequence-1":       AboutTreelistSequence1;
    "about.treelist-sequence-2":       AboutTreelistSequence2;
    "about.treelist-sequence-3":       AboutTreelistSequence3;
    "about.treelist-sequence-4":       AboutTreelistSequence4;
    "about.version-update-revised":    AboutVersionUpdateRevised;
    "about.version-updates":           AboutVersionUpdates;
    "about.visual-diff":               AboutVisualDiff;
    "front-page.apple":                FrontPageApple;
    "front-page.copy":                 FrontPageCopy;
    "front-page.discord":              FrontPageDiscord;
    "front-page.drop-down-arrow":      FrontPageDropDownArrow;
    "front-page.floro-round":          FrontPageFloroRound;
    "front-page.front-page-backdrop":  FrontPageFrontPageBackdrop;
    "front-page.github":               FrontPageGithub;
    "front-page.language":             FrontPageLanguage;
    "front-page.linux":                FrontPageLinux;
    "front-page.moon":                 FrontPageMoon;
    "front-page.sun":                  FrontPageSun;
    "front-page.windows":              FrontPageWindows;
    "main.floro":                      MainFloro;
    "main.floro-text":                 MainFloroText;
}

export interface AboutBackward {
    default:  Theme;
    variants: AboutBackwardVariants;
}

export interface Theme {
    dark:  string;
    light: string;
}

export interface AboutBackwardVariants {
}

export interface AboutCascadingRelations {
    default:  Theme;
    variants: AboutCascadingRelationsVariants;
}

export interface AboutCascadingRelationsVariants {
}

export interface AboutDiffKeys {
    default:  Theme;
    variants: AboutDiffKeysVariants;
}

export interface AboutDiffKeysVariants {
}

export interface AboutFloroPipeline {
    default:  Theme;
    variants: AboutFloroPipelineVariants;
}

export interface AboutFloroPipelineVariants {
}

export interface AboutForward {
    default:  Theme;
    variants: AboutForwardVariants;
}

export interface AboutForwardVariants {
}

export interface AboutKeySyntax {
    default:  Theme;
    variants: AboutKeySyntaxVariants;
}

export interface AboutKeySyntaxVariants {
}

export interface AboutListTransform {
    default:  Theme;
    variants: AboutListTransformVariants;
}

export interface AboutListTransformVariants {
}

export interface AboutOverview {
    default:  Theme;
    variants: AboutOverviewVariants;
}

export interface AboutOverviewVariants {
}

export interface AboutPause {
    default:  Theme;
    variants: AboutPauseVariants;
}

export interface AboutPauseVariants {
}

export interface AboutPlay {
    default:  Theme;
    variants: AboutPlayVariants;
}

export interface AboutPlayVariants {
}

export interface AboutRelationsRefactorPart1 {
    default:  Theme;
    variants: AboutRelationsRefactorPart1_Variants;
}

export interface AboutRelationsRefactorPart1_Variants {
}

export interface AboutSetToTypes {
    default:  Theme;
    variants: AboutSetToTypesVariants;
}

export interface AboutSetToTypesVariants {
}

export interface AboutSetUpdates {
    default:  Theme;
    variants: AboutSetUpdatesVariants;
}

export interface AboutSetUpdatesVariants {
}

export interface AboutSpreadsheet {
    default:  Theme;
    variants: AboutSpreadsheetVariants;
}

export interface AboutSpreadsheetVariants {
}

export interface AboutSpreadsheetKeys {
    default:  Theme;
    variants: AboutSpreadsheetKeysVariants;
}

export interface AboutSpreadsheetKeysVariants {
}

export interface AboutStateChange {
    default:  Theme;
    variants: AboutStateChangeVariants;
}

export interface AboutStateChangeVariants {
}

export interface AboutTreelistSequence1 {
    default:  Theme;
    variants: AboutTreelistSequence1_Variants;
}

export interface AboutTreelistSequence1_Variants {
}

export interface AboutTreelistSequence2 {
    default:  Theme;
    variants: AboutTreelistSequence2_Variants;
}

export interface AboutTreelistSequence2_Variants {
}

export interface AboutTreelistSequence3 {
    default:  Theme;
    variants: AboutTreelistSequence3_Variants;
}

export interface AboutTreelistSequence3_Variants {
}

export interface AboutTreelistSequence4 {
    default:  Theme;
    variants: AboutTreelistSequence4_Variants;
}

export interface AboutTreelistSequence4_Variants {
}

export interface AboutVersionUpdateRevised {
    default:  Theme;
    variants: AboutVersionUpdateRevisedVariants;
}

export interface AboutVersionUpdateRevisedVariants {
}

export interface AboutVersionUpdates {
    default:  Theme;
    variants: AboutVersionUpdatesVariants;
}

export interface AboutVersionUpdatesVariants {
}

export interface AboutVisualDiff {
    default:  Theme;
    variants: AboutVisualDiffVariants;
}

export interface AboutVisualDiffVariants {
}

export interface FrontPageApple {
    default:  Theme;
    variants: FrontPageAppleVariants;
}

export interface FrontPageAppleVariants {
    hovered: Theme;
}

export interface FrontPageCopy {
    default:  Theme;
    variants: FrontPageCopyVariants;
}

export interface FrontPageCopyVariants {
}

export interface FrontPageDiscord {
    default:  Theme;
    variants: FrontPageDiscordVariants;
}

export interface FrontPageDiscordVariants {
    hovered: Theme;
}

export interface FrontPageDropDownArrow {
    default:  Theme;
    variants: FrontPageDropDownArrowVariants;
}

export interface FrontPageDropDownArrowVariants {
    hovered: Theme;
}

export interface FrontPageFloroRound {
    default:  Theme;
    variants: FrontPageFloroRoundVariants;
}

export interface FrontPageFloroRoundVariants {
}

export interface FrontPageFrontPageBackdrop {
    default:  Theme;
    variants: FrontPageFrontPageBackdropVariants;
}

export interface FrontPageFrontPageBackdropVariants {
}

export interface FrontPageGithub {
    default:  Theme;
    variants: FrontPageGithubVariants;
}

export interface FrontPageGithubVariants {
    hovered: Theme;
}

export interface FrontPageLanguage {
    default:  Theme;
    variants: FrontPageLanguageVariants;
}

export interface FrontPageLanguageVariants {
    hovered: Theme;
}

export interface FrontPageLinux {
    default:  Theme;
    variants: FrontPageLinuxVariants;
}

export interface FrontPageLinuxVariants {
    hovered: Theme;
}

export interface FrontPageMoon {
    default:  Theme;
    variants: FrontPageMoonVariants;
}

export interface FrontPageMoonVariants {
}

export interface FrontPageSun {
    default:  Theme;
    variants: FrontPageSunVariants;
}

export interface FrontPageSunVariants {
}

export interface FrontPageWindows {
    default:  Theme;
    variants: FrontPageWindowsVariants;
}

export interface FrontPageWindowsVariants {
    hovered: Theme;
}

export interface MainFloro {
    default:  Theme;
    variants: MainFloroVariants;
}

export interface MainFloroVariants {
}

export interface MainFloroText {
    default:  Theme;
    variants: MainFloroTextVariants;
}

export interface MainFloroTextVariants {
}

// Converts JSON strings to/from your types
export class Convert {
    public static toIcons(json: string): Icons {
        return JSON.parse(json);
    }

    public static iconsToJson(value: Icons): string {
        return JSON.stringify(value);
    }
}
