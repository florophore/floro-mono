import ColorPalette from "@floro/styles/ColorPalette";
import { ColorTheme } from "@floro/styles/ColorThemes";

export const getColorForRow = (theme: ColorTheme, row: number) => {
  if (row % 5 == 0) {
    return theme.name == "light"
      ? ColorPalette.purple
      : ColorPalette.lightPurple;
  }
  if (row % 5 == 1) {
    return theme.name == "light" ? ColorPalette.linkBlue : ColorPalette.linkBlue;
  }

  if (row % 5 == 2) {
    return theme.name == "light" ? ColorPalette.teal : ColorPalette.teal;
  }

  if (row % 5 == 3) {
    return theme.name == "light" ? ColorPalette.orange : ColorPalette.orange;
  }

  if (row % 5 == 4) {
    return theme.name == "light" ? ColorPalette.red : ColorPalette.lightRed;
  }
};
