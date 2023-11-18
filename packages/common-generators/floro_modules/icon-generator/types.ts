// To parse this data:
//
//   import { Convert, Icons } from "./file";
//
//   const icons = Convert.toIcons(json);

export interface Icons {
    "about.floro-pipeline":           AboutFloroPipeline;
    "about.key-syntax":               AboutKeySyntax;
    "about.list-transform":           AboutListTransform;
    "front-page.apple":               FrontPageApple;
    "front-page.copy":                FrontPageCopy;
    "front-page.discord":             FrontPageDiscord;
    "front-page.drop-down-arrow":     FrontPageDropDownArrow;
    "front-page.floro-round":         FrontPageFloroRound;
    "front-page.front-page-backdrop": FrontPageFrontPageBackdrop;
    "front-page.github":              FrontPageGithub;
    "front-page.language":            FrontPageLanguage;
    "front-page.linux":               FrontPageLinux;
    "front-page.moon":                FrontPageMoon;
    "front-page.sun":                 FrontPageSun;
    "front-page.windows":             FrontPageWindows;
    "main.floro":                     MainFloro;
    "main.floro-text":                MainFloroText;
}

export interface AboutFloroPipeline {
    default:  Theme;
    variants: AboutFloroPipelineVariants;
}

export interface Theme {
    dark:  string;
    light: string;
}

export interface AboutFloroPipelineVariants {
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
