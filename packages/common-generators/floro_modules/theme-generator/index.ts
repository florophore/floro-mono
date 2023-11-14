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
    "primary-color":        PrimaryColor;
    "primary-font-color":   PrimaryFontColor;
    "secondary-color":      SecondaryColor;
    "secondary-font-color": SecondaryFontColor;
}

export interface PrimaryColor {
    default:  ThemeSet;
    variants: PrimaryColorVariants;
}

export interface ThemeSet {
    dark:  null | string;
    light: null | string;
}

export interface PrimaryColorVariants {
    focused:  ThemeSet;
    hovered:  ThemeSet;
    selected: ThemeSet;
}

export interface PrimaryFontColor {
    default:  ThemeSet;
    variants: PrimaryFontColorVariants;
}

export interface PrimaryFontColorVariants {
    focused:  ThemeSet;
    hovered:  ThemeSet;
    selected: ThemeSet;
}

export interface SecondaryColor {
    default:  ThemeSet;
    variants: SecondaryColorVariants;
}

export interface SecondaryColorVariants {
    focused:  ThemeSet;
    hovered:  ThemeSet;
    selected: ThemeSet;
}

export interface SecondaryFontColor {
    default:  ThemeSet;
    variants: SecondaryFontColorVariants;
}

export interface SecondaryFontColorVariants {
    focused:  ThemeSet;
    hovered:  ThemeSet;
    selected: ThemeSet;
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