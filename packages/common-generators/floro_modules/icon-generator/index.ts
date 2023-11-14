import { Icons, Theme } from "./types";

import icon0 from './icons/main.floro-text.default.light.33ad7105.svg';
import icon1 from './icons/main.floro-text.default.dark.33ad7105.svg';
import icon2 from './icons/main.floro.default.light.e5baeb49.svg';
import icon3 from './icons/main.floro.default.dark.e5baeb49.svg';
import icon4 from './icons/front-page.front-page-backdrop.default.light.766e1625.svg';
import icon5 from './icons/front-page.front-page-backdrop.default.dark.766e1625.svg';
import icon6 from './icons/front-page.floro-round.default.light.56c8e11e.svg';
import icon7 from './icons/front-page.floro-round.default.dark.56c8e11e.svg';

export default {
  ["main.floro-text"]: {
    default: {
      ["light"]: icon0,
      ["dark"]: icon1,
    },
    variants: {
    },
  },
  ["main.floro"]: {
    default: {
      ["light"]: icon2,
      ["dark"]: icon3,
    },
    variants: {
    },
  },
  ["front-page.front-page-backdrop"]: {
    default: {
      ["light"]: icon4,
      ["dark"]: icon5,
    },
    variants: {
    },
  },
  ["front-page.floro-round"]: {
    default: {
      ["light"]: icon6,
      ["dark"]: icon7,
    },
    variants: {
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