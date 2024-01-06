import React from "react";

import { FloroDebugProvider } from "./FloroDebugProvider";
import { FloroPaletteProvider } from "./FloroPaletteProvider";
import { FloroThemesProvider } from "./FloroThemesProvider";
import { FloroIconsProvider } from "./FloroIconsProvider";
import { FloroTextProvider } from "./FloroTextProvider";
import { LocalizedPhrases } from "@floro/common-generators/floro_modules/text-generator";
import { FloroLocalesProvider } from "./hooks/locales";
import { FloroSSRPhraseKeyMemoProvider } from "./FloroSSRPhraseKeyMemoProvider";

interface Props {
  children: React.ReactElement;
  text: LocalizedPhrases;
  initLocaleCode: keyof LocalizedPhrases["locales"]&string;
  cdnHost: string;
  ssrPhraseKeySet?: Set<string>;
  localeLoads: {[key: string]: string};
}

const FloroMount = (props: Props) => {
  return (
    <FloroSSRPhraseKeyMemoProvider ssrPhraseKeySet={props.ssrPhraseKeySet}>
      <FloroDebugProvider>
        <FloroPaletteProvider>
          <FloroThemesProvider>
            <FloroIconsProvider>
              <FloroTextProvider cdnHost={props.cdnHost} text={props.text} localeLoads={props.localeLoads}>
                <FloroLocalesProvider initLocaleCode={props.initLocaleCode}>{props.children}</FloroLocalesProvider>
              </FloroTextProvider>
            </FloroIconsProvider>
          </FloroThemesProvider>
        </FloroPaletteProvider>
      </FloroDebugProvider>
    </FloroSSRPhraseKeyMemoProvider>
  );
};

export default FloroMount;
