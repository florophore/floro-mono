import '@emotion/react';
import type { ColorTheme } from '@floro/styles/ColorThemes';

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends ColorTheme {}
}