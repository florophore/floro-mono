import React from "react";

import { FloroDebugProvider } from "./FloroDebugProvider";
import { FloroPaletteProvider } from "./FloroPaletteProvider";
import { FloroThemesProvider } from "./FloroThemesProvider";
import { FloroIconsProvider } from "./FloroIconsProvider";
import { FloroTextProvider } from "./FloroTextProvider";
import { LocalizedPhrases } from "@floro/common-generators/floro_modules/text-generator";
import { FloroLocalesProvider } from "./hooks/locales";
import { FloroTodoProvider } from "./FloroTodoProvider";

interface Props {
  children: React.ReactElement;
  text: LocalizedPhrases;
}

const FloroMount = (props: Props) => {
  return (
    <FloroDebugProvider>
      <FloroPaletteProvider>
        <FloroThemesProvider>
          <FloroIconsProvider>
            <FloroTextProvider text={props.text}>
              <FloroTodoProvider>
                <FloroLocalesProvider>{props.children}</FloroLocalesProvider>
              </FloroTodoProvider>
            </FloroTextProvider>
          </FloroIconsProvider>
        </FloroThemesProvider>
      </FloroPaletteProvider>
    </FloroDebugProvider>
  );
};

export default FloroMount;
