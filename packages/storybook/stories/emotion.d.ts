import '@emotion/react'
import { ColorTheme } from '@floro/styles/ColorThemes';

declare module '@emotion/react' {
  export interface Theme extends ColorTheme {}
}