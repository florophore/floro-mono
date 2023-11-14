import paletteJSON from './palette.json';

// To parse this data:
//
//   import { Convert, Palette } from "./file";
//
//   const palette = Convert.toPalette(json);

export interface Palette {
    black:  Shade;
    blue:   Shade;
    gray:   Shade;
    orange: Shade;
    purple: Shade;
    red:    Shade;
    teal:   Shade;
    white:  Shade;
}

export interface Shade {
    dark:    null | string;
    light:   null | string;
    lighter: null | string;
    regular: null | string;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toPalette(json: string): Palette {
        return JSON.parse(json);
    }

    public static paletteToJson(value: Palette): string {
        return JSON.stringify(value);
    }
}

export const getPaletteColor = <
  T extends keyof Palette,
  U extends keyof Shade,
>(
  palette: Palette,
  color: T,
  shade: U,
): string | null => {
  return palette[color][shade];
};

export default paletteJSON as Palette;