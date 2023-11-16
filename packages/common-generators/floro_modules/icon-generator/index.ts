import { Icons, Theme } from "./types";

import icon0 from './icons/main.floro-text.default.light.5b6af1cf.svg';
import icon1 from './icons/main.floro-text.default.dark.5b6af1cf.svg';
import icon2 from './icons/main.floro.default.light.e5baeb49.svg';
import icon3 from './icons/main.floro.default.dark.e5baeb49.svg';
import icon4 from './icons/front-page.github.default.light.c5d4b597.svg';
import icon5 from './icons/front-page.github.default.dark.8f3e602e.svg';
import icon6 from './icons/front-page.github.hovered.light.76daab54.svg';
import icon7 from './icons/front-page.github.hovered.dark.76daab54.svg';
import icon8 from './icons/front-page.discord.default.light.4ba1b005.svg';
import icon9 from './icons/front-page.discord.default.dark.9b68ee9c.svg';
import icon10 from './icons/front-page.discord.hovered.light.9d1c01c2.svg';
import icon11 from './icons/front-page.discord.hovered.dark.9d1c01c2.svg';
import icon12 from './icons/front-page.copy.default.light.49b0e44d.svg';
import icon13 from './icons/front-page.copy.default.dark.c8c865e4.svg';
import icon14 from './icons/front-page.linux.default.light.16fb231a.svg';
import icon15 from './icons/front-page.linux.default.dark.4a5cff74.svg';
import icon16 from './icons/front-page.linux.hovered.light.3e113f71.svg';
import icon17 from './icons/front-page.linux.hovered.dark.3e113f71.svg';
import icon18 from './icons/front-page.apple.default.light.618d7c43.svg';
import icon19 from './icons/front-page.apple.default.dark.b6e5f0a9.svg';
import icon20 from './icons/front-page.apple.hovered.light.ba0d7f0c.svg';
import icon21 from './icons/front-page.apple.hovered.dark.ba0d7f0c.svg';
import icon22 from './icons/front-page.windows.default.light.f51d3a6d.svg';
import icon23 from './icons/front-page.windows.default.dark.ddb1f4c5.svg';
import icon24 from './icons/front-page.windows.hovered.light.22e899a8.svg';
import icon25 from './icons/front-page.windows.hovered.dark.22e899a8.svg';
import icon26 from './icons/front-page.front-page-backdrop.default.light.766e1625.svg';
import icon27 from './icons/front-page.front-page-backdrop.default.dark.766e1625.svg';
import icon28 from './icons/front-page.floro-round.default.light.56c8e11e.svg';
import icon29 from './icons/front-page.floro-round.default.dark.56c8e11e.svg';

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
  ["front-page.github"]: {
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
  ["front-page.discord"]: {
    default: {
      ["light"]: icon8,
      ["dark"]: icon9,
    },
    variants: {
      ["hovered"]: {
        ["light"]: icon10,
        ["dark"]: icon11,
      },
    },
  },
  ["front-page.copy"]: {
    default: {
      ["light"]: icon12,
      ["dark"]: icon13,
    },
    variants: {
    },
  },
  ["front-page.linux"]: {
    default: {
      ["light"]: icon14,
      ["dark"]: icon15,
    },
    variants: {
      ["hovered"]: {
        ["light"]: icon16,
        ["dark"]: icon17,
      },
    },
  },
  ["front-page.apple"]: {
    default: {
      ["light"]: icon18,
      ["dark"]: icon19,
    },
    variants: {
      ["hovered"]: {
        ["light"]: icon20,
        ["dark"]: icon21,
      },
    },
  },
  ["front-page.windows"]: {
    default: {
      ["light"]: icon22,
      ["dark"]: icon23,
    },
    variants: {
      ["hovered"]: {
        ["light"]: icon24,
        ["dark"]: icon25,
      },
    },
  },
  ["front-page.front-page-backdrop"]: {
    default: {
      ["light"]: icon26,
      ["dark"]: icon27,
    },
    variants: {
    },
  },
  ["front-page.floro-round"]: {
    default: {
      ["light"]: icon28,
      ["dark"]: icon29,
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