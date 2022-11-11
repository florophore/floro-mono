import React, {useEffect, useState, useMemo} from 'react';
import {ThemeProvider} from '@emotion/react';
import {BrowserRouter} from 'react-router-dom';
import {DarkTheme, LightTheme} from '@floro/styles/ColorThemes';
import Router from './Router';
import {SystemAPIProvider} from './contexts/SystemAPIContext';
import {ApolloClient, ApolloProvider, InMemoryCache, HttpLink, split} from '@apollo/client';

import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {createClient} from 'graphql-ws';
import {getMainDefinition} from '@apollo/client/utilities';
import DOMMount from '@floro/common-react/src/components/mounts/DOMMount';
import {QueryClient, QueryClientProvider} from 'react-query';
import {FloroSocketProvider} from '@floro/common-react/src/pubsub/socket';
import {setContext} from '@apollo/client/link/context';
import Cookies from 'js-cookie';
import {SessionProvider} from '@floro/common-react/src/session/session-context';
import ColorPalette from '@floro/styles/ColorPalette';

const authMiddleware = setContext((_, {headers}) => {
  // add the authorization to the headers
  const token = Cookies.get('user-session');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});
const httpLink = new HttpLink({
  uri: 'http://localhost:9000/graphql',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:9000/graphql-subscriptions',
    lazy: false,
    disablePong: false,
    keepAlive: 10_000,
  }),
);

const splitLink = split(
  ({query}) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: authMiddleware.concat(splitLink),
  cache: new InMemoryCache(),
});

interface Props {
  systemAPI: SystemAPI;
}

const useSystemColorTheme = () => {
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
      subscribe((systemTheme: 'dark' | 'light') => {
        if (systemTheme == 'light') {
          setColorTheme(LightTheme);
        }
        if (systemTheme == 'dark') {
          setColorTheme(DarkTheme);
        }
      });
    })();
  }, []);

  return colorTheme;
};

const App = (props: Props): React.ReactElement => {
  const colorTheme = useSystemColorTheme();
  const queryClient = useMemo(() => new QueryClient(), []);

  useEffect(() => {
    if (colorTheme == LightTheme) {
      document.body.style.backgroundColor = ColorPalette.lightModeBG;
    } else {
      document.body.style.backgroundColor = ColorPalette.darkModeBG;
    }

  }, [colorTheme]);

  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <SystemAPIProvider systemAPI={props.systemAPI}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={colorTheme}>
              <FloroSocketProvider client={'desktop'}>
                <SessionProvider>
                  <DOMMount>
                    <Router />
                  </DOMMount>
                </SessionProvider>
              </FloroSocketProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </SystemAPIProvider>
      </ApolloProvider>
    </BrowserRouter>
  );
};
export default App;
