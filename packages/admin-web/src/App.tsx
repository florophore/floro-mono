import React, { useEffect, useState } from 'react';
import routing from './Routing';
import './App.css'
import { ThemeProvider } from '@emotion/react';
import { DarkTheme, LightTheme } from '@floro/styles/ColorThemes';
import {
  Routes,
  Route,
} from "react-router-dom";

function App() {
  const [colorTheme, setColorTheme] = useState(LightTheme);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setColorTheme(DarkTheme);
    } else {
      setColorTheme(LightTheme);
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      const colorScheme = event.matches ? "dark" : "light";
      if (colorScheme == 'dark') {
        setColorTheme(DarkTheme);
      } else {
        setColorTheme(LightTheme);
      }
  });

  }, [])

  return (
      <ThemeProvider theme={colorTheme}>
        <Routes>
          {routing.map((route, key) => {
            const Page = route.component();
            return (
              <Route key={key} path={route.path} element={
                <React.Suspense>
                  <Page/>
                </React.Suspense>
            }/>
            );
          })}
        </Routes>
      </ThemeProvider>
  );
}

export default App;
