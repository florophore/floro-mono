// To parse this data:
//
//   import { Convert, Icons } from "./file";
//
//   const icons = Convert.toIcons(json);

export interface Icons {
    "front-page.apple":               FrontPageApple;
    "front-page.copy":                FrontPageCopy;
    "front-page.discord":             FrontPageDiscord;
    "front-page.floro-round":         FrontPageFloroRound;
    "front-page.front-page-backdrop": FrontPageFrontPageBackdrop;
    "front-page.github":              FrontPageGithub;
    "front-page.linux":               FrontPageLinux;
    "front-page.windows":             FrontPageWindows;
    "main.floro":                     MainFloro;
    "main.floro-text":                MainFloroText;
}

export interface FrontPageApple {
    default:  Theme;
    variants: FrontPageAppleVariants;
}

export interface Theme {
    dark:  string;
    light: string;
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

export interface FrontPageLinux {
    default:  Theme;
    variants: FrontPageLinuxVariants;
}

export interface FrontPageLinuxVariants {
    hovered: Theme;
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
