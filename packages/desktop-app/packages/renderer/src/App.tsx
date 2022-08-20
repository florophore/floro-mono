import React, { useEffect, useState } from 'react';
import { ThemeProvider } from "@emotion/react";
import { BrowserRouter } from "react-router-dom";
import { DarkTheme, LightTheme } from '@floro/styles/ColorThemes';
import Router from './Router';


const App = (): React.ReactElement => {
  const [colorTheme, setColorTheme] = useState(DarkTheme);
  useEffect(() => {
    (async () => {
      const systemAPI = await window.systemAPI;
      const systemTheme = await systemAPI.getSystemTheme();
      if (systemTheme == 'light') {
        setColorTheme(LightTheme);
      }
      if (systemTheme == 'dark') {
        setColorTheme(DarkTheme);
      }
      const subscribe = await systemAPI.subscribeToSystemThemeChange;
      subscribe((systemTheme: 'dark'|'light') => {
        if (systemTheme == 'light') {
          setColorTheme(LightTheme);
        }
        if (systemTheme == 'dark') {
          setColorTheme(DarkTheme);
        }
      });
    })();
  }, []);

  return (
    <ThemeProvider theme={colorTheme}>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </ThemeProvider>
  );
};
export default App;