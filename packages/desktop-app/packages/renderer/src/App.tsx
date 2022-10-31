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
import {trpc, trpcClient, protectedTrpc, protectedTrpcClient} from '@floro/common-web/src/trpc';
import { FloroSocketProvider } from '@floro/common-react/src/pubsub/socket';
import { setContext } from '@apollo/client/link/context';
import Cookies from 'js-cookie';

const authMiddleware = setContext((_, { headers }) => {
  // add the authorization to the headers
  const token = Cookies.get('user-session');
  return {
    headers: {
      ...headers,
      authorizationToken: token ? token : "",
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

  return (
    <ApolloProvider client={client}>
      <SystemAPIProvider systemAPI={props.systemAPI}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <protectedTrpc.Provider client={protectedTrpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider theme={colorTheme}>
                <FloroSocketProvider client={'desktop'}>
                  <DOMMount>
                    <BrowserRouter>
                      <Router />
                    </BrowserRouter>
                  </DOMMount>
                </FloroSocketProvider>
              </ThemeProvider>
            </QueryClientProvider>
          </protectedTrpc.Provider>
        </trpc.Provider>
      </SystemAPIProvider>
    </ApolloProvider>
  );
};
export default App;
