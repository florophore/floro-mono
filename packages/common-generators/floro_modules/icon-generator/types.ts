// To parse this data:
//
//   import { Convert, Icons } from "./file";
//
//   const icons = Convert.toIcons(json);

export interface Icons {
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
