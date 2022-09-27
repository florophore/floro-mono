import React, { useEffect, useState, useMemo } from 'react';
import { ThemeProvider } from '@emotion/react';
import { BrowserRouter } from 'react-router-dom';
import { DarkTheme, LightTheme } from '@floro/styles/ColorThemes';
import Router from './Router';
import { SystemAPIProvider } from './contexts/SystemAPIContext';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';


interface Props {
  systemAPI: SystemAPI;
}

const App = (props: Props): React.ReactElement => {
  const [colorTheme, setColorTheme] = useState(DarkTheme);

  const client = useMemo(() => new ApolloClient({
    cache: new InMemoryCache(),
  }), []);

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
    <ApolloProvider client={client}>
      <SystemAPIProvider systemAPI={props.systemAPI}>
        <ThemeProvider theme={colorTheme}>
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </ThemeProvider>
      </SystemAPIProvider>
    </ApolloProvider>
  );
};
export default App;