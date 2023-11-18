import React from "react";

import { FloroDebugProvider } from "./FloroDebugProvider";
import { FloroPaletteProvider } from "./FloroPaletteProvider";
import { FloroThemesProvider } from "./FloroThemesProvider";
import { FloroIconsProvider } from "./FloroIconsProvider";
import { FloroTextProvider } from "./FloroTextProvider";
import { LocalizedPhrases } from "@floro/common-generators/floro_modules/text-generator";
import { FloroLocalesProvider } from "./hooks/locales";

interface Props {
  children: React.ReactElement;
  text: LocalizedPhrases;
  initLocaleCode: keyof LocalizedPhrases["locales"]&string;
}

const FloroMount = (props: Props) => {
  return (
    <FloroDebugProvider>
      <FloroPaletteProvider>
        <FloroThemesProvider>
          <FloroIconsProvider>
            <FloroTextProvider text={props.text}>
              <FloroLocalesProvider initLocaleCode={props.initLocaleCode}>{props.children}</FloroLocalesProvider>
            </FloroTextProvider>
          </FloroIconsProvider>
        </FloroThemesProvider>
      </FloroPaletteProvider>
    </FloroDebugProvider>
  );
};

export default FloroMount;
