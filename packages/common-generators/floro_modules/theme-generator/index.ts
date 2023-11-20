import themesJSON from './themes.json';

// To parse this data:
//
//   import { Convert, Themes } from "./file";
//
//   const themes = Convert.toThemes(json);

export interface Themes {
    themeColors:      ThemeColors;
    themeDefinitions: ThemeDefinitions;
}

export interface ThemeColors {
    "contrast-text":        ContrastText;
    "contrast-text-light":  ContrastTextLight;
    "icon-bg":              IconBg;
    "icon-contrast-fg":     IconContrastFg;
    "icon-purple":          IconPurple;
    "icon-single-contrast": IconSingleContrast;
    "reverse-contrast-bg":  ReverseContrastBg;
}

export interface ContrastText {
    default:  ThemeSet;
    variants: ContrastTextVariants;
}

export interface ThemeSet {
    dark:  null | string;
    light: null | string;
}

export interface ContrastTextVariants {
}

export interface ContrastTextLight {
    default:  ThemeSet;
    variants: ContrastTextLightVariants;
}

export interface ContrastTextLightVariants {
}

export interface IconBg {
    default:  ThemeSet;
    variants: IconBgVariants;
}

export interface IconBgVariants {
    focused:  ThemeSet;
    hovered:  ThemeSet;
    selected: ThemeSet;
}

export interface IconContrastFg {
    default:  ThemeSet;
    variants: IconContrastFgVariants;
}

export interface IconContrastFgVariants {
    focused:  ThemeSet;
    hovered:  ThemeSet;
    selected: ThemeSet;
}

export interface IconPurple {
    default:  ThemeSet;
    variants: IconPurpleVariants;
}

export interface IconPurpleVariants {
}

export interface IconSingleContrast {
    default:  ThemeSet;
    variants: IconSingleContrastVariants;
}

export interface IconSingleContrastVariants {
    focused:  ThemeSet;
    hovered:  ThemeSet;
    selected: ThemeSet;
}

export interface ReverseContrastBg {
    default:  ThemeSet;
    variants: ReverseContrastBgVariants;
}

export interface ReverseContrastBgVariants {
}

export interface ThemeDefinitions {
    dark:  Dark;
    light: Light;
}

export interface Dark {
    background: string;
    name:       string;
}

export interface Light {
    background: string;
    name:       string;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toThemes(json: string): Themes {
        return JSON.parse(json);
    }

    public static themesToJson(value: Themes): string {
        return JSON.stringify(value);
    }
}

export const getThemeDefintion = <T extends keyof ThemeDefinitions>(
  themeDefintions: ThemeDefinitions,
  themeDefintionName: T
): ThemeDefinitions[T] => {
  return themeDefintions[themeDefintionName];
}

export const getThemeColor = <
  T extends keyof ThemeColors,
  U extends keyof ThemeSet,
  K extends keyof ThemeColors[T]["variants"]|"default"
>(
  themeColors: ThemeColors,
  themeName: U,
  themeColorKey: T,
  variant?: K
): string|null => {
  const themeColor = themeColors[themeColorKey];
  const defaultColor = themeColor.default[themeName];
  if (!variant || variant == "default") {
    return defaultColor;
  }
  return (
    themeColor.variants[variant as keyof typeof themeColor.variants][
      themeName
    ] ?? defaultColor
  );
};

export default themesJSON as Themes;