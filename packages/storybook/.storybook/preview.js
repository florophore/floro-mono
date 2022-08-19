import { ThemeProvider } from "@emotion/react";
import { addDecorator } from '@storybook/react';
import { ColorThemes } from '@floro/styles/ColorThemes';


addDecorator((StoryFn, args) => {
  const story = StoryFn();
  const themeName = args?.parameters.backgrounds.values?.find?.(bg => {
    return args?.globals?.backgrounds?.value == bg.value;
  })?.name ?? 'light'; 
  const theme = ColorThemes.find(t => t.name == themeName) ?? themes[0];
  return (
    <ThemeProvider theme={theme}>
      {story}
    </ThemeProvider>
  );

});

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  backgrounds: {
    default: 'light',
    values: ColorThemes.map(t => ({name: t.name, value: t.background}))
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}