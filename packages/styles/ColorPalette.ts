export interface ColorPalette {
  white: string;
  black: string;
  lightModeBG: string;
  darkModeBG: string;
  lightGray: string;
  gray: string;
  mediumGray: string;
  darkGray: string;
  lightRed: string;
  red: string;
  lightOrange: string;
  orange: string;
  lightBrown: string;
  lightTeal: string;
  teal: string;
  darkTeal: string;
  lightPurple: string;
  purple: string;
  darkPurple: string;
  linkBlue: string;
}
const ColorPalette = {
    white: '#FFFFFFFF',
    lightModeBG: '#FFFFFFFF',
    darkModeBG: '#222222FF',
    black: '#000000FF',
    lightGray: '#E3E2E2FF',
    gray: '#7C7C7CFF',
    mediumGray: '#414141FF',
    darkGray: '#222222FF',
    lightRed: '#FF3D44FF',
    red: '#CC2E34FF',
    darkBrown: '#602A2CFF',
    lightOrange: '#FEB76CFF',
    orange: '#FD8C16FF',
    lightBrown: '#C97319FF',
    lightTeal: '#91ECE7FF',
    teal: '#23C2B9FF',
    darkTeal: '#235653FF',
    lightPurple: '#9B8FF7FF',
    purple: '#5445C4FF',
    darkPurple: '#251F51FF',
    linkBlue: '#56A4FAFF'
} as ColorPalette;

export default ColorPalette;

export const Opacity = {
  0: '00',
  20: '33',
  30: '4C',
  50: '80',
  70: 'B2',
  80: 'CC',
  100: 'FF'
}; 