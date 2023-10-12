// To parse this data:
//
//   import { Convert, Icons } from "./file";
//
//   const icons = Convert.toIcons(json);

export interface Icons {
    "main.billing": MainBilling;
    "main.discard": MainDiscard;
}

export interface MainBilling {
    default:  Theme;
    variants: MainBillingVariants;
}

export interface Theme {
    dark:  string;
    light: string;
}

export interface MainBillingVariants {
    hovered: Theme;
}

export interface MainDiscard {
    default:  Theme;
    variants: MainDiscardVariants;
}

export interface MainDiscardVariants {
    hovered: Theme;
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
