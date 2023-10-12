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
    "main-background":      MainBackground;
    "main-theme":           MainTheme;
    "new-theme":            NewTheme;
    "primary-color":        PrimaryColor;
    "primary-font-color":   PrimaryFontColor;
    "primary-negative":     PrimaryNegative;
    "secondary-color":      SecondaryColor;
    "secondary-font-color": SecondaryFontColor;
}

export interface MainBackground {
    default:  ThemeSet;
    variants: MainBackgroundVariants;
}

export interface ThemeSet {
    dark:  null | string;
    light: null | string;
}

export interface MainBackgroundVariants {
}

export interface MainTheme {
    default:  ThemeSet;
    variants: MainThemeVariants;
}

export interface MainThemeVariants {
}

export interface NewTheme {
    default:  ThemeSet;
    variants: NewThemeVariants;
}

export interface NewThemeVariants {
    focused:  ThemeSet;
    hovered:  ThemeSet;
    selected: ThemeSet;
}

export interface PrimaryColor {
    default:  ThemeSet;
    variants: PrimaryColorVariants;
}

export interface PrimaryColorVariants {
}

export interface PrimaryFontColor {
    default:  ThemeSet;
    variants: PrimaryFontColorVariants;
}

export interface PrimaryFontColorVariants {
}

export interface PrimaryNegative {
    default:  ThemeSet;
    variants: PrimaryNegativeVariants;
}

export interface PrimaryNegativeVariants {
    focused:  ThemeSet;
    hovered:  ThemeSet;
    selected: ThemeSet;
}

export interface SecondaryColor {
    default:  ThemeSet;
    variants: SecondaryColorVariants;
}

export interface SecondaryColorVariants {
}

export interface SecondaryFontColor {
    default:  ThemeSet;
    variants: SecondaryFontColorVariants;
}

export interface SecondaryFontColorVariants {
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