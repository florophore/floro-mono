import React from "react";

import { FloroDebugProvider } from "./FloroDebugProvider";
import { FloroPaletteProvider } from "./FloroPaletteProvider";
import { FloroThemesProvider } from "./FloroThemesProvider";
import { FloroIconsProvider } from "./FloroIconsProvider";

interface Props {
  children: React.ReactElement;
}

const FloroMount = (props: Props) => {
  return (
    <FloroDebugProvider>
      <FloroPaletteProvider>
        <FloroThemesProvider>
          <FloroIconsProvider>{props.children}</FloroIconsProvider>
        </FloroThemesProvider>
      </FloroPaletteProvider>
    </FloroDebugProvider>
  );
};

export default FloroMount;
