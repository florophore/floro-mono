import { Icons, Theme } from "./types";

import icon0 from './icons/about.play.default.light.fd35c6d0.svg';
import icon1 from './icons/about.play.default.dark.bc44f73b.svg';
import icon2 from './icons/about.pause.default.light.ecc9132f.svg';
import icon3 from './icons/about.pause.default.dark.db09c6a4.svg';
import icon4 from './icons/about.backward.default.light.2c1c3c46.svg';
import icon5 from './icons/about.backward.default.dark.3a6fe9b1.svg';
import icon6 from './icons/about.forward.default.light.ee852924.svg';
import icon7 from './icons/about.forward.default.dark.3b57b099.svg';
import icon8 from './icons/about.version-updates.default.light.185c7813.svg';
import icon9 from './icons/about.version-updates.default.dark.7b891320.svg';
import icon10 from './icons/about.set-updates.default.light.9aa76d9.svg';
import icon11 from './icons/about.set-updates.default.dark.c89aad27.svg';
import icon12 from './icons/about.version-update-revised.default.light.a52dbf11.svg';
import icon13 from './icons/about.version-update-revised.default.dark.e34a69aa.svg';
import icon14 from './icons/about.spreadsheet.default.light.db9a5b35.svg';
import icon15 from './icons/about.spreadsheet.default.dark.345fbbc5.svg';
import icon16 from './icons/about.cascading-relations.default.light.a1b17c26.svg';
import icon17 from './icons/about.cascading-relations.default.dark.b08e1cff.svg';
import icon18 from './icons/about.overview.default.light.6fe5c288.svg';
import icon19 from './icons/about.overview.default.dark.d596cf0d.svg';
import icon20 from './icons/about.relations-refactor-part-1.default.light.60b191c0.svg';
import icon21 from './icons/about.relations-refactor-part-1.default.dark.ef01e1d9.svg';
import icon22 from './icons/about.set-to-types.default.light.46f08462.svg';
import icon23 from './icons/about.set-to-types.default.dark.c45594c4.svg';
import icon24 from './icons/about.treelist-sequence-4.default.light.d2ad609a.svg';
import icon25 from './icons/about.treelist-sequence-4.default.dark.2052399.svg';
import icon26 from './icons/about.treelist-sequence-3.default.light.ec5bbe47.svg';
import icon27 from './icons/about.treelist-sequence-3.default.dark.83f45e66.svg';
import icon28 from './icons/about.treelist-sequence-2.default.light.328d5dd9.svg';
import icon29 from './icons/about.treelist-sequence-2.default.dark.3d8f6399.svg';
import icon30 from './icons/about.treelist-sequence-1.default.light.7567d1b3.svg';
import icon31 from './icons/about.treelist-sequence-1.default.dark.d2828dc1.svg';
import icon32 from './icons/about.key-syntax.default.light.821c2c9d.svg';
import icon33 from './icons/about.key-syntax.default.dark.adc94954.svg';
import icon34 from './icons/about.list-transform.default.light.a273d5c5.svg';
import icon35 from './icons/about.list-transform.default.dark.bea305bc.svg';
import icon36 from './icons/about.floro-pipeline.default.light.b8b57607.svg';
import icon37 from './icons/about.floro-pipeline.default.dark.eed72910.svg';
import icon38 from './icons/main.floro-text.default.light.5b6af1cf.svg';
import icon39 from './icons/main.floro-text.default.dark.5b6af1cf.svg';
import icon40 from './icons/main.floro.default.light.e5baeb49.svg';
import icon41 from './icons/main.floro.default.dark.e5baeb49.svg';
import icon42 from './icons/front-page.moon.default.light.fc9d69.svg';
import icon43 from './icons/front-page.moon.default.dark.51635314.svg';
import icon44 from './icons/front-page.sun.default.light.f64ef912.svg';
import icon45 from './icons/front-page.sun.default.dark.43218087.svg';
import icon46 from './icons/front-page.drop-down-arrow.default.light.e5e80061.svg';
import icon47 from './icons/front-page.drop-down-arrow.default.dark.3953b278.svg';
import icon48 from './icons/front-page.drop-down-arrow.hovered.light.a121e89e.svg';
import icon49 from './icons/front-page.drop-down-arrow.hovered.dark.a121e89e.svg';
import icon50 from './icons/front-page.language.default.light.be1ae1bb.svg';
import icon51 from './icons/front-page.language.default.dark.fa5c6dc4.svg';
import icon52 from './icons/front-page.language.hovered.light.369b3cde.svg';
import icon53 from './icons/front-page.language.hovered.dark.369b3cde.svg';
import icon54 from './icons/front-page.github.default.light.c5d4b597.svg';
import icon55 from './icons/front-page.github.default.dark.8f3e602e.svg';
import icon56 from './icons/front-page.github.hovered.light.76daab54.svg';
import icon57 from './icons/front-page.github.hovered.dark.76daab54.svg';
import icon58 from './icons/front-page.discord.default.light.4ba1b005.svg';
import icon59 from './icons/front-page.discord.default.dark.9b68ee9c.svg';
import icon60 from './icons/front-page.discord.hovered.light.9d1c01c2.svg';
import icon61 from './icons/front-page.discord.hovered.dark.9d1c01c2.svg';
import icon62 from './icons/front-page.copy.default.light.49b0e44d.svg';
import icon63 from './icons/front-page.copy.default.dark.c8c865e4.svg';
import icon64 from './icons/front-page.linux.default.light.16fb231a.svg';
import icon65 from './icons/front-page.linux.default.dark.4a5cff74.svg';
import icon66 from './icons/front-page.linux.hovered.light.3e113f71.svg';
import icon67 from './icons/front-page.linux.hovered.dark.3e113f71.svg';
import icon68 from './icons/front-page.apple.default.light.618d7c43.svg';
import icon69 from './icons/front-page.apple.default.dark.b6e5f0a9.svg';
import icon70 from './icons/front-page.apple.hovered.light.ba0d7f0c.svg';
import icon71 from './icons/front-page.apple.hovered.dark.ba0d7f0c.svg';
import icon72 from './icons/front-page.windows.default.light.f51d3a6d.svg';
import icon73 from './icons/front-page.windows.default.dark.ddb1f4c5.svg';
import icon74 from './icons/front-page.windows.hovered.light.22e899a8.svg';
import icon75 from './icons/front-page.windows.hovered.dark.22e899a8.svg';
import icon76 from './icons/front-page.front-page-backdrop.default.light.766e1625.svg';
import icon77 from './icons/front-page.front-page-backdrop.default.dark.766e1625.svg';
import icon78 from './icons/front-page.floro-round.default.light.56c8e11e.svg';
import icon79 from './icons/front-page.floro-round.default.dark.56c8e11e.svg';

export default {
  ["about.play"]: {
    default: {
      ["light"]: icon0,
      ["dark"]: icon1,
    },
    variants: {
    },
  },
  ["about.pause"]: {
    default: {
      ["light"]: icon2,
      ["dark"]: icon3,
    },
    variants: {
    },
  },
  ["about.backward"]: {
    default: {
      ["light"]: icon4,
      ["dark"]: icon5,
    },
    variants: {
    },
  },
  ["about.forward"]: {
    default: {
      ["light"]: icon6,
      ["dark"]: icon7,
    },
    variants: {
    },
  },
  ["about.version-updates"]: {
    default: {
      ["light"]: icon8,
      ["dark"]: icon9,
    },
    variants: {
    },
  },
  ["about.set-updates"]: {
    default: {
      ["light"]: icon10,
      ["dark"]: icon11,
    },
    variants: {
    },
  },
  ["about.version-update-revised"]: {
    default: {
      ["light"]: icon12,
      ["dark"]: icon13,
    },
    variants: {
    },
  },
  ["about.spreadsheet"]: {
    default: {
      ["light"]: icon14,
      ["dark"]: icon15,
    },
    variants: {
    },
  },
  ["about.cascading-relations"]: {
    default: {
      ["light"]: icon16,
      ["dark"]: icon17,
    },
    variants: {
    },
  },
  ["about.overview"]: {
    default: {
      ["light"]: icon18,
      ["dark"]: icon19,
    },
    variants: {
    },
  },
  ["about.relations-refactor-part-1"]: {
    default: {
      ["light"]: icon20,
      ["dark"]: icon21,
    },
    variants: {
    },
  },
  ["about.set-to-types"]: {
    default: {
      ["light"]: icon22,
      ["dark"]: icon23,
    },
    variants: {
    },
  },
  ["about.treelist-sequence-4"]: {
    default: {
      ["light"]: icon24,
      ["dark"]: icon25,
    },
    variants: {
    },
  },
  ["about.treelist-sequence-3"]: {
    default: {
      ["light"]: icon26,
      ["dark"]: icon27,
    },
    variants: {
    },
  },
  ["about.treelist-sequence-2"]: {
    default: {
      ["light"]: icon28,
      ["dark"]: icon29,
    },
    variants: {
    },
  },
  ["about.treelist-sequence-1"]: {
    default: {
      ["light"]: icon30,
      ["dark"]: icon31,
    },
    variants: {
    },
  },
  ["about.key-syntax"]: {
    default: {
      ["light"]: icon32,
      ["dark"]: icon33,
    },
    variants: {
    },
  },
  ["about.list-transform"]: {
    default: {
      ["light"]: icon34,
      ["dark"]: icon35,
    },
    variants: {
    },
  },
  ["about.floro-pipeline"]: {
    default: {
      ["light"]: icon36,
      ["dark"]: icon37,
    },
    variants: {
    },
  },
  ["main.floro-text"]: {
    default: {
      ["light"]: icon38,
      ["dark"]: icon39,
    },
    variants: {
    },
  },
  ["main.floro"]: {
    default: {
      ["light"]: icon40,
      ["dark"]: icon41,
    },
    variants: {
    },
  },
  ["front-page.moon"]: {
    default: {
      ["light"]: icon42,
      ["dark"]: icon43,
    },
    variants: {
    },
  },
  ["front-page.sun"]: {
    default: {
      ["light"]: icon44,
      ["dark"]: icon45,
    },
    variants: {
    },
  },
  ["front-page.drop-down-arrow"]: {
    default: {
      ["light"]: icon46,
      ["dark"]: icon47,
    },
    variants: {
      ["hovered"]: {
        ["light"]: icon48,
        ["dark"]: icon49,
      },
    },
  },
  ["front-page.language"]: {
    default: {
      ["light"]: icon50,
      ["dark"]: icon51,
    },
    variants: {
      ["hovered"]: {
        ["light"]: icon52,
        ["dark"]: icon53,
      },
    },
  },
  ["front-page.github"]: {
    default: {
      ["light"]: icon54,
      ["dark"]: icon55,
    },
    variants: {
      ["hovered"]: {
        ["light"]: icon56,
        ["dark"]: icon57,
      },
    },
  },
  ["front-page.discord"]: {
    default: {
      ["light"]: icon58,
      ["dark"]: icon59,
    },
    variants: {
      ["hovered"]: {
        ["light"]: icon60,
        ["dark"]: icon61,
      },
    },
  },
  ["front-page.copy"]: {
    default: {
      ["light"]: icon62,
      ["dark"]: icon63,
    },
    variants: {
    },
  },
  ["front-page.linux"]: {
    default: {
      ["light"]: icon64,
      ["dark"]: icon65,
    },
    variants: {
      ["hovered"]: {
        ["light"]: icon66,
        ["dark"]: icon67,
      },
    },
  },
  ["front-page.apple"]: {
    default: {
      ["light"]: icon68,
      ["dark"]: icon69,
    },
    variants: {
      ["hovered"]: {
        ["light"]: icon70,
        ["dark"]: icon71,
      },
    },
  },
  ["front-page.windows"]: {
    default: {
      ["light"]: icon72,
      ["dark"]: icon73,
    },
    variants: {
      ["hovered"]: {
        ["light"]: icon74,
        ["dark"]: icon75,
      },
    },
  },
  ["front-page.front-page-backdrop"]: {
    default: {
      ["light"]: icon76,
      ["dark"]: icon77,
    },
    variants: {
    },
  },
  ["front-page.floro-round"]: {
    default: {
      ["light"]: icon78,
      ["dark"]: icon79,
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