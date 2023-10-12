import { Icons, Theme } from "./types";

import icon0 from './icons/main.discard.default.light.53054e9b.svg';
import icon1 from './icons/main.discard.default.dark.8df9b323.svg';
import icon2 from './icons/main.discard.hovered.light.87bfed69.svg';
import icon3 from './icons/main.discard.hovered.dark.fa1ea3f9.svg';
import icon4 from './icons/main.billing.default.light.1e5732fa.svg';
import icon5 from './icons/main.billing.default.dark.62dda3b1.svg';
import icon6 from './icons/main.billing.hovered.light.1e5732fa.svg';
import icon7 from './icons/main.billing.hovered.dark.62dda3b1.svg';

export default {
  ["main.discard"]: {
    default: {
      ["light"]: icon0,
      ["dark"]: icon1,
    },
    variants: {
      ["hovered"]: {
        ["light"]: icon2,
        ["dark"]: icon3,
      },
    },
  },
  ["main.billing"]: {
    default: {
      ["light"]: icon4,
      ["dark"]: icon5,
    },
    variants: {
      ["hovered"]: {
        ["light"]: icon6,
        ["dark"]: icon7,
      },
    },
  },
} as Icons;

export const getIcon = <
  T extends keyof Icons,
  U extends keyof Theme,
  K extends keyof Icons[T]["variants"] | "default"
>(
  icons: Icons,
  themeName: U,
  iconKey: T,
  variant?: K
): string => {
  const defaultIcon = icons[iconKey].default[themeName];
  if (!variant || variant == "default") {
    return defaultIcon;
  }
  const icon = icons[iconKey] as Icons[T];
  return (
    icon.variants[variant as keyof typeof icon.variants][themeName] ??
    defaultIcon
  );
};