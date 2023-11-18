import React, { useMemo, useEffect } from "react";
import { ThemeProvider } from "@emotion/react";
import { useSystemColorTheme } from "./color-theme";
import { useColorTheme } from "./ColorThemeProvider";
import { DarkTheme, LightTheme } from "@floro/styles/ColorThemes";
import ColorPalette from "@floro/styles/ColorPalette";
import { ThemeSet } from "@floro/common-generators/floro_modules/theme-generator";

interface Props {
  initTheme?: keyof ThemeSet;
  children: React.ReactElement;
}

const ThemeMount = (props: Props) => {
  console.log("IT", props?.initTheme)
  const systemColor = useSystemColorTheme(props?.initTheme ?? "light");
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

export default React.memo(ThemeMount);
