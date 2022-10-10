import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@emotion/react';
import { BrowserRouter } from 'react-router-dom';
import { DarkTheme, LightTheme } from '@floro/styles/ColorThemes';
import Router from './Router';
import { SystemAPIProvider } from './contexts/SystemAPIContext';
import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink, split } from '@apollo/client';

import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import DOMMount from '@floro/common-react/src/components/mounts/DOMMount';

const httpLink = new HttpLink({
  uri: 'http://localhost:9000/graphql',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:9000/graphql-subscriptions',
    lazy: false,
    disablePong: false,
    keepAlive: 10_000
  }),
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

interface Props {
  systemAPI: SystemAPI;
}

const App = (props: Props): React.ReactElement => {
  const [colorTheme, setColorTheme] = useState(LightTheme);

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
            <DOMMount>
              <Router />
            </DOMMount>
          </BrowserRouter>
        </ThemeProvider>
      </SystemAPIProvider>
    </ApolloProvider>
  );
};
export default App;