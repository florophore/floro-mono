
import React, { useMemo, useEffect } from "react";
import { ThemeProvider } from "@emotion/react";
import { DarkTheme, LightTheme } from "@floro/styles/ColorThemes";
import ColorPalette from "@floro/styles/ColorPalette";
import { ThemeSet } from "@floro/common-generators/floro_modules/theme-generator";
import { useDesktopSystemColorTheme } from "@floro/common-web/src/hooks/color-theme";
import { useColorTheme } from "@floro/common-web/src/hooks/ColorThemeProvider";

interface Props {
  initTheme?: keyof ThemeSet;
  children: React.ReactElement;
}

const DesktopThemeMount = (props: Props) => {
  const systemColor = useDesktopSystemColorTheme();
  const { themePreference } = useColorTheme();

  const colorTheme = useMemo(() => {
    if (themePreference == "system") {
      return systemColor;
    }
    return themePreference == "light" ? LightTheme : DarkTheme;
  }, [themePreference, systemColor]);

  useEffect(() => {
    if (colorTheme == LightTheme) {
      document.body.style.backgroundColor = ColorPalette.lightModeBG;
    } else {
      document.body.style.backgroundColor = ColorPalette.darkModeBG;
    }
  }, [colorTheme]);

  return <ThemeProvider theme={colorTheme}>{props.children}</ThemeProvider>;
};

export default React.memo(DesktopThemeMount);
